import * as yup from 'yup';
import { ROLE_ENUM } from '../constants/roles.constants.js';

export const createOrganizationSchema = yup.object({
  name: yup
    .string()
    .required('Organization name is required')
    .trim(),
  logoUrl: yup
    .string()
    .url('Logo URL must be a valid URL')
    .trim()
    .default(''),
});

export const inviteMemberSchema = yup.object({
  email: yup
    .string()
    .email('Must be a valid email address')
    .required('Email is required')
    .trim(),
  role: yup
    .string()
    .oneOf(ROLE_ENUM, 'Invalid role')
    .default('member'),
});
