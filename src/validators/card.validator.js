import * as yup from 'yup';

export const createCardSchema = yup.object({
  slug: yup
    .string()
    .required('Slug is required')
    .matches(/^[a-z0-9-_]+$/, 'Slug must only contain lowercase letters, numbers, hyphens, and underscores')
    .trim(),
  title: yup
    .string()
    .required('Title is required')
    .trim(),
});

const sectionValidationSchema = yup.object({
  sectionId: yup.string().required('Section ID is required'),
  type: yup.string().required('Section Type is required'),
  order: yup.number().integer().required('Order is required'),
  isVisible: yup.boolean().default(true),
  data: yup.mixed().default({}),
});

export const updateCardSchema = yup.object({
  title: yup.string().trim(),
  sections: yup.array().of(sectionValidationSchema),
  seo: yup.object({
    metaTitle: yup.string().trim().default(''),
    metaDescription: yup.string().trim().default(''),
    ogImageUrl: yup.string().url('Must be a valid URL').trim().default(''),
  }).default({}),
  displayPresetId: yup.string().trim().nullable(),
  colorThemeId: yup.string().trim().nullable(),
  footerPresetId: yup.string().trim().nullable(),
  imageUrl: yup.string().trim().nullable(), // Allow empty string or path or url
  imageScale: yup.number().integer().default(100),
  imagePositionX: yup.number().default(0),
  imagePositionY: yup.number().default(0),
  imageOpacity: yup.number().integer().min(0).max(100).default(80),
  overlayType: yup.string().trim().default('None'),
  imageRotation: yup.number().default(0),
  imagePlacement: yup.string().trim().default('Inside Header'),
  containerStyle: yup.string().trim().default('None'),
  containerSize: yup.number().default(100),
  containerBorder: yup.boolean().default(false),
  containerShadow: yup.boolean().default(false),
  containerPadding: yup.number().default(0),
  imageFit: yup.string().trim().default('Cover'),
  imageBlur: yup.number().default(0),
  imageBrightness: yup.number().default(100),
  imageContrast: yup.number().default(100),
  imageSaturation: yup.number().default(100),
});
