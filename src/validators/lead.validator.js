import * as yup from 'yup';

export const submitLeadSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .trim(),
  email: yup
    .string()
    .email('Must be a valid email address')
    .required('Email is required')
    .trim(),
  phone: yup
    .string()
    .trim()
    .default(''),
  message: yup
    .string()
    .trim()
    .default(''),
  source: yup
    .string()
    .oneOf(['form', 'reverse_save'], 'Invalid source')
    .default('form'),
  consentGiven: yup
    .boolean()
    .oneOf([true], 'Consent must be given to submit your information')
    .required('Consent is required'),
});
