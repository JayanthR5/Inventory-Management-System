const assert = require("node:assert/strict");
const { beforeEach, test } = require("node:test");
const Module = require("node:module");

const cache = new Map();
const invalidatedUsers = [];
const productsByUser = new Map();
const stockHistory = [];
let mongoReadCount = 0;
let productWriteError = null;
let stockHistoryWriteError = null;

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
    if (request.endsWith("/utils/AsyncHandler")) {
        return (handler) => (req, res, next) =>
            Promise.resolve(handler(req, res, next)).catch(next);
    }

    if (request.endsWith("/models/ProductModel")) {
        return {
            find: (query) => ({
                sort: async () => {
                    mongoReadCount += 1;
                    return productsByUser.get(String(query.user)) || [];
                }
            }),
            findOne: async (query) => {
                if (productWriteError) {
                    throw productWriteError;
                }

                const products = productsByUser.get(String(query.user)) || [];
                return products.find((product) => String(product._id) === String(query._id)) || null;
            },
            findOneAndUpdate: async (query, update) => {
                if (productWriteError) {
                    throw productWriteError;
                }

                const products = productsByUser.get(String(query.user)) || [];
                const product = products.find((item) => String(item._id) === String(query._id));
                if (!product || (query.quantity?.$gte !== undefined &&
                    product.quantity < query.quantity.$gte)) {
                    return null;
                }

                product.quantity += update.$inc.quantity;
                return product;
            },
            create: async (productData) => {
                if (productWriteError) {
                    throw productWriteError;
                }

                const product = makeProduct(productData);
                const userProducts = productsByUser.get(String(productData.user)) || [];
                userProducts.push(product);
                productsByUser.set(String(productData.user), userProducts);
                return product;
            }
        };
    }

    if (request.endsWith("/models/StockHistoryModel")) {
        return {
            create: async (entry) => {
                if (stockHistoryWriteError) {
                    throw stockHistoryWriteError;
                }
                stockHistory.push(entry);
            },
            deleteMany: async () => undefined,
            find: () => ({
                populate: () => ({
                    sort: async () => []
                })
            })
        };
    }

    if (request.endsWith("/redis")) {
        return {
            getCachedJson: async (key) => cache.get(key) || null,
            setCachedJson: async (key, value) => cache.set(key, value),
            invalidateUserProductCaches: async (userId) => {
                invalidatedUsers.push(String(userId));
                cache.delete(`products:user:${userId}`);
                cache.delete(`low-stock:user:${userId}`);
            }
        };
    }

    return originalLoad.apply(this, arguments);
};

const {
    createProduct,
    getProducts,
    getLowStockProducts,
    updateProduct,
    deleteProduct,
    stockIn,
    stockOut
} = require("../controllers/ProductController");

function makeProduct(productData) {
    return {
        ...productData,
        _id: productData._id || `${productData.user}-${Date.now()}-${Math.random()}`,
        quantity: productData.quantity || 0,
        save: async function () {
            if (productWriteError) {
                throw productWriteError;
            }
            return this;
        },
        deleteOne: async function () {
            const userProducts = productsByUser.get(String(this.user)) || [];
            productsByUser.set(
                String(this.user),
                userProducts.filter((product) => product._id !== this._id)
            );
        }
    };
}

function response() {
    return {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(value) {
            this.body = value;
        }
    };
}

async function invoke(handler, req) {
    const res = response();
    let nextError;
    await handler(req, res, (error) => {
        nextError = error;
    });
    return { res, nextError };
}

beforeEach(() => {
    cache.clear();
    invalidatedUsers.length = 0;
    productsByUser.clear();
    stockHistory.length = 0;
    mongoReadCount = 0;
    productWriteError = null;
    stockHistoryWriteError = null;
});

test("product list uses MongoDB on miss and Redis on hit", async () => {
    productsByUser.set("user-a", [{ _id: "product-a", user: "user-a", name: "Keyboard" }]);
    const request = { user: { id: "user-a" } };

    const first = await invoke(getProducts, request);
    const second = await invoke(getProducts, request);

    assert.equal(first.res.statusCode, 200);
    assert.deepEqual(second.res.body, first.res.body);
    assert.equal(mongoReadCount, 1);
    assert.deepEqual(cache.get("products:user:user-a"), first.res.body);
});

test("low-stock list uses its separate user-scoped cache key", async () => {
    productsByUser.set("user-a", [{ _id: "product-a", user: "user-a", quantity: 2 }]);
    const result = await invoke(getLowStockProducts, { user: { id: "user-a" } });

    assert.equal(result.res.statusCode, 200);
    assert.deepEqual(cache.get("low-stock:user:user-a"), result.res.body);
    assert.equal(cache.has("products:user:user-a"), false);
});

test("product caches are isolated by authenticated user", async () => {
    productsByUser.set("user-a", [{ user: "user-a", name: "A" }]);
    productsByUser.set("user-b", [{ user: "user-b", name: "B" }]);

    await invoke(getProducts, { user: { id: "user-a" } });
    await invoke(getProducts, { user: { id: "user-b" } });

    assert.deepEqual(cache.get("products:user:user-a"), [{ user: "user-a", name: "A" }]);
    assert.deepEqual(cache.get("products:user:user-b"), [{ user: "user-b", name: "B" }]);
});

test("successful product and stock mutations invalidate the user caches", async () => {
    const userId = "user-a";
    const product = makeProduct({
        _id: "product-a",
        user: userId,
        name: "Keyboard",
        category: "Accessories",
        quantity: 10,
        minStock: 2
    });
    productsByUser.set(userId, [product]);
    cache.set(`products:user:${userId}`, ["cached-products"]);
    cache.set(`low-stock:user:${userId}`, ["cached-low-stock"]);

    await invoke(createProduct, {
        user: { id: userId },
        body: { name: "Mouse", category: "Accessories", quantity: 0 }
    });
    await invoke(updateProduct, {
        user: { id: userId },
        params: { id: "product-a" },
        body: { price: 20 }
    });
    await invoke(stockIn, {
        user: { id: userId },
        body: { productId: "product-a", quantity: 1 }
    });
    await invoke(stockOut, {
        user: { id: userId },
        body: { productId: "product-a", quantity: 1 }
    });
    await invoke(deleteProduct, {
        user: { id: userId },
        params: { id: "product-a" }
    });

    assert.deepEqual(invalidatedUsers, [userId, userId, userId, userId, userId]);
    assert.equal(cache.has(`products:user:${userId}`), false);
    assert.equal(cache.has(`low-stock:user:${userId}`), false);
});

test("MongoDB write failures do not produce success responses", async () => {
    productWriteError = new Error("MongoDB write failed");
    const result = await invoke(createProduct, {
        user: { id: "user-a" },
        body: { name: "Keyboard", category: "Accessories", quantity: 0 }
    });

    assert.equal(result.res.body, undefined);
    assert.equal(result.nextError.message, "MongoDB write failed");
    assert.deepEqual(invalidatedUsers, []);
});

test("secondary write failures do not report a successful mutation", async () => {
    stockHistoryWriteError = new Error("Stock history write failed");
    const product = makeProduct({
        _id: "product-a",
        user: "user-a",
        quantity: 10
    });
    productsByUser.set("user-a", [product]);

    const result = await invoke(stockIn, {
        user: { id: "user-a" },
        body: { productId: "product-a", quantity: 1 }
    });

    assert.equal(result.res.body, undefined);
    assert.equal(result.nextError.message, "Stock history write failed");
    assert.deepEqual(invalidatedUsers, ["user-a"]);
});
