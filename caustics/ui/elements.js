const elementCache = new Map();

function cacheKey(prefix, value) {
    return `${prefix}:${value}`;
}

export const UIElements = {
    get(id) {
        const key = cacheKey('id', id);
        if (!elementCache.has(key)) {
            elementCache.set(key, document.getElementById(id));
        }
        return elementCache.get(key);
    },

    query(selector) {
        const key = cacheKey('query', selector);
        if (!elementCache.has(key)) {
            elementCache.set(key, document.querySelector(selector));
        }
        return elementCache.get(key);
    },

    queryAll(selector) {
        return document.querySelectorAll(selector);
    },

    invalidate(id) {
        elementCache.delete(cacheKey('id', id));
    },

    clear() {
        elementCache.clear();
    }
};
