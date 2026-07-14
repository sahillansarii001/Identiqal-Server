/**
 * Validation middleware using Yup schemas.
 * @param {import('yup').Schema} schema - The Yup validation schema.
 */
const validate = (schema) => async (req, res, next) => {
  try {
    const validatedBody = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Strips fields not defined in schema
    });
    // Replace req.body with the validated and stripped data
    req.body = validatedBody;
    next();
  } catch (error) {
    const errorMessage = error.errors ? error.errors.join(', ') : error.message;
    res.status(400).json({
      success: false,
      message: `Validation Error: ${errorMessage}`,
    });
  }
};

export default validate;
