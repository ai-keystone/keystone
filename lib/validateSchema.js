// lib/validateSchema.js (CommonJS)
//
// JSON Schema validation for PlanSpec using Ajv (draft 2020-12).
// Returns { valid: boolean, errors: string[] }.

const Ajv = require("ajv");
const schema = require("./planSchema.json");

const ajv = new Ajv({
  strict: false,          // tolerate minor schema issues while you're iterating
  allErrors: true,        // collect all errors
  allowUnionTypes: true,  // helpful during schema evolution
});

const validate = ajv.compile(schema);

function formatAjvErrors(ajvErrors) {
  if (!Array.isArray(ajvErrors) || ajvErrors.length === 0) return [];
  return ajvErrors.map(e => {
    const path = e.instancePath || "(root)";
    const msg = e.message || "schema validation error";
    const extra = e.params ? ` (${JSON.stringify(e.params)})` : "";
    return `${path}: ${msg}${extra}`;
  });
}

function validatePlanSpecSchema(planSpec) {
  const ok = validate(planSpec);
  return { valid: !!ok, errors: ok ? [] : formatAjvErrors(validate.errors) };
}

module.exports = { validatePlanSpecSchema };