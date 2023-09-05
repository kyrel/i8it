type QueryObject = ReturnType<typeof import("h3")["getQuery"]>;

function required(request: any, name: string) {
  const rawValue = request[name];
  if (rawValue == undefined)
    throw createError({ status: 400, message: `${name} not specified` });
  return rawValue;
}

export function requiredString(request: any, name: string) {
  const value = required(request, name);
  if (typeof value != "string")
    throw createError({
      status: 400,
      message: `${name}: unexpectedly not a string`,
    });
  if (!value)
    throw createError({
      status: 400,
      message: `${name}: non-empty value expected`,
    });
  return value;
}

export function requiredNumber(
  request: any,
  name: string,
  options: {
    moreThan?: number;
    moreThanOrEqualTo?: number;
    lessOrEqualTo?: number;
  } = {}
) {
  const stringValue = required(request, name);
  const value = parseFloat(stringValue);
  if (isNaN(value))
    throw createError({ status: 400, message: `${name}: not a proper number` });
  if (options.moreThan != undefined && value <= options.moreThan)
    throw createError({
      status: 400,
      message: `${name} should be more than ${options.moreThan}`,
    });
  if (
    options.moreThanOrEqualTo != undefined &&
    value < options.moreThanOrEqualTo
  )
    throw createError({
      status: 400,
      message: `${name} should be more than or equal to ${options.moreThanOrEqualTo}`,
    });
  return value;
}

export function optionalNumber(
  request: any,
  name: string,
  options: {
    moreThan?: number;
    lessOrEqualTo?: number;
  } = {}
) {
  const stringValue = request[name];
  if (stringValue == undefined || stringValue == "") {
    return undefined;
  }
  const value = parseFloat(stringValue);
  if (isNaN(value))
    throw createError({ status: 400, message: `${name}: not a proper number` });
  if (options.moreThan != undefined && value <= options.moreThan)
    throw createError({
      status: 400,
      message: `${name} should be more than ${options.moreThan}`,
    });
  return value;
}
