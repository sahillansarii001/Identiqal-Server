import * as yup from 'yup';

const sectionValidationSchema = yup.object({
  sectionId: yup.string().required(),
  type: yup.string().required(),
  order: yup.number().integer().required(),
  isVisible: yup.boolean().default(true),
  data: yup.mixed().default({}),
});

const schema = yup.object({
  sections: yup.array().of(sectionValidationSchema),
});

async function run() {
  const input = {
    sections: [
      {
        sectionId: '123',
        type: 'links',
        order: 1,
        isVisible: true,
        data: {
          links: [{ url: 'http://a.com', label: 'A' }]
        },
        unknownField: 'this should be stripped'
      }
    ]
  };

  const output = await schema.validate(input, { stripUnknown: true });
  console.log(JSON.stringify(output, null, 2));
}

run();
