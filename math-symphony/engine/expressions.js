export function describeExpression(expression, controllerSnapshot, controllerMap) {
    const params = (expression.paramKeys || []).map((key) => {
        const controller = controllerMap.get(key);
        if (!controller) return null;
        const value = controllerSnapshot[key];
        const precision = controller.precision ?? 2;
        return `${controller.label} = ${Number(value).toFixed(precision)}`;
    }).filter(Boolean);

    return {
        ...expression,
        parameterSummary: params.join(' | ')
    };
}

export function buildControllerMap(score) {
    return new Map(score.controllers.map((controller) => [controller.id, controller]));
}
