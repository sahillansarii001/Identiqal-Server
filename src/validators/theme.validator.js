import * as yup from 'yup';

export const themeSchema = yup.object({
  colors: yup.object({
    primary: yup.string().matches(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color').default('#000000'),
    secondary: yup.string().matches(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color').default('#6c757d'),
    background: yup.string().matches(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color').default('#ffffff'),
    text: yup.string().matches(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color').default('#212529'),
    accent: yup.string().matches(/^#([0-9a-fA-F]{3}){1,2}$/, 'Must be a valid hex color').default('#0d6efd'),
  }).default({}),
  font: yup.object({
    heading: yup.string().trim().default('Inter'),
    body: yup.string().trim().default('Inter'),
  }).default({}),
  layoutStyle: yup
    .string()
    .oneOf(['minimal', 'bold', 'corporate', 'creative'], 'Invalid layout style')
    .default('minimal'),
  buttonStyle: yup
    .string()
    .oneOf(['rounded', 'square', 'outline'], 'Invalid button style')
    .default('rounded'),
  isLockedByOrg: yup.boolean().default(false),
});
