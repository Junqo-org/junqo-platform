-- Adminer 4.8.1 PostgreSQL 17.0 dump

\connect "junqo";

DROP TABLE IF EXISTS "Users";
CREATE TABLE "public"."Users" (
    "id" uuid NOT NULL,
    "name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "createdAt" timestamptz NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    CONSTRAINT "Users_email_key" UNIQUE ("email"),
    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "Users" ("id", "name", "email", "createdAt", "updatedAt") VALUES
('69df7b30-dc70-4253-8aef-463bb862c768',	'user1',	'user1@mail.com',	'2024-12-01 04:59:13.397+00',	'2024-12-01 04:59:13.397+00'),
('bf1e9c31-4276-4b8b-b123-9b42facbf1a9',	'user2',	'user2@mail.com',	'2024-12-01 04:59:13.416+00',	'2024-12-01 04:59:13.416+00'),
('b9063336-4170-4ec8-9933-5b91ca807a31',	'user3',	'user3@mail.com',	'2024-12-01 04:59:13.42+00',	'2024-12-01 04:59:13.42+00'),
('b2592157-6efa-4b72-933d-8007143cca10',	'user4',	'user4@mail.com',	'2024-12-01 04:59:13.425+00',	'2024-12-01 04:59:13.425+00'),
('9efaff55-9995-4375-a07f-0d730bd3ba6b',	'user5',	'user5@mail.com',	'2024-12-01 04:59:13.43+00',	'2024-12-01 04:59:13.43+00'),
('2fced6fd-f835-4967-82c7-1c9f0d217eb4',	'user6',	'user6@mail.com',	'2024-12-01 04:59:13.434+00',	'2024-12-01 04:59:13.434+00'),
('ac3217c3-2b93-4072-9a23-65bc832a3ac8',	'user7',	'user7@mail.com',	'2024-12-01 04:59:13.439+00',	'2024-12-01 04:59:13.439+00'),
('9999993e-0aa8-4a9d-9a51-b5ac9dba0f1c',	'user8',	'user8@mail.com',	'2024-12-01 04:59:13.444+00',	'2024-12-01 04:59:13.444+00'),
('01b4221f-272f-4331-a364-5f911611242d',	'user9',	'user9@mail.com',	'2024-12-01 04:59:13.448+00',	'2024-12-01 04:59:13.448+00'),
('7c3acef8-cc8a-4777-b678-57eac0346b2f',	'user10',	'user10@mail.com',	'2024-12-01 04:59:13.453+00',	'2024-12-01 04:59:13.453+00'),
('dd93c563-0d8c-4a44-919a-af8ebf4c5609',	'user11',	'user11@mail.com',	'2024-12-01 04:59:13.46+00',	'2024-12-01 04:59:13.46+00'),
('ee109fd7-2dd6-45be-867e-495fa9d5f9da',	'user12',	'user12@mail.com',	'2024-12-01 04:59:13.465+00',	'2024-12-01 04:59:13.465+00'),
('971c3f4d-8e61-430c-9b27-a3ecac6a387e',	'user13',	'user13@mail.com',	'2024-12-01 04:59:13.471+00',	'2024-12-01 04:59:13.471+00'),
('d10eb460-0593-4bc1-955f-fe39e32bc589',	'user14',	'user14@mail.com',	'2024-12-01 04:59:13.476+00',	'2024-12-01 04:59:13.476+00'),
('1e9b1987-57a1-49c5-8d1e-699149c837b1',	'user15',	'user15@mail.com',	'2024-12-01 04:59:13.481+00',	'2024-12-01 04:59:13.481+00'),
('82d3a503-4f58-43dd-b11c-9cd00e36615b',	'user16',	'user16@mail.com',	'2024-12-01 04:59:13.487+00',	'2024-12-01 04:59:13.487+00'),
('28343625-7ab2-4cc5-b617-ee79620fb271',	'user17',	'user17@mail.com',	'2024-12-01 04:59:13.492+00',	'2024-12-01 04:59:13.492+00'),
('cc4c0672-3eac-4b1b-a013-407e843d4b65',	'user18',	'user18@mail.com',	'2024-12-01 04:59:13.497+00',	'2024-12-01 04:59:13.497+00'),
('3e157175-2f7e-49fe-b0ad-11688194bf04',	'user19',	'user19@mail.com',	'2024-12-01 04:59:13.503+00',	'2024-12-01 04:59:13.503+00'),
('d46ea3e5-729f-420c-af3e-e3c8e504965c',	'user20',	'user20@mail.com',	'2024-12-01 04:59:13.508+00',	'2024-12-01 04:59:13.508+00'),
('8b5f622a-8f9e-411f-b525-17b37d33afe2',	'user21',	'user21@mail.com',	'2024-12-01 04:59:13.513+00',	'2024-12-01 04:59:13.513+00'),
('ba98d1a9-b73e-4f15-8255-5b0e15eea1d7',	'user22',	'user22@mail.com',	'2024-12-01 04:59:13.519+00',	'2024-12-01 04:59:13.519+00'),
('e4e33c78-ead8-4dd7-a59d-87e8d5448fb7',	'user23',	'user23@mail.com',	'2024-12-01 04:59:13.525+00',	'2024-12-01 04:59:13.525+00'),
('a66ddf85-0feb-45ca-9c18-572570f14456',	'user24',	'user24@mail.com',	'2024-12-01 04:59:13.53+00',	'2024-12-01 04:59:13.53+00'),
('e81ebb4b-1a3b-4667-b8f8-85270832514c',	'user25',	'user25@mail.com',	'2024-12-01 04:59:13.535+00',	'2024-12-01 04:59:13.535+00'),
('c04159c8-4516-4c3f-b2da-efee77c1f83f',	'user26',	'user26@mail.com',	'2024-12-01 04:59:13.541+00',	'2024-12-01 04:59:13.541+00'),
('b2cf2f41-74cf-4fab-a281-5522a8850420',	'user27',	'user27@mail.com',	'2024-12-01 04:59:13.547+00',	'2024-12-01 04:59:13.547+00'),
('0a66ff09-3006-42c0-9f39-5632c2f27283',	'user28',	'user28@mail.com',	'2024-12-01 04:59:13.552+00',	'2024-12-01 04:59:13.552+00'),
('35e405e9-4c6a-4a5b-b7f1-f6b2319beccd',	'user29',	'user29@mail.com',	'2024-12-01 04:59:13.558+00',	'2024-12-01 04:59:13.558+00'),
('c3473cd8-a035-46c4-8bc1-76b120eb2250',	'user30',	'user30@mail.com',	'2024-12-01 04:59:13.564+00',	'2024-12-01 04:59:13.564+00'),
('3e284403-2e71-4253-863c-9d7467263380',	'user31',	'user31@mail.com',	'2024-12-01 04:59:13.569+00',	'2024-12-01 04:59:13.569+00'),
('87e4fa99-a4ac-4710-91e2-d30fc3ba2b38',	'user32',	'user32@mail.com',	'2024-12-01 04:59:13.575+00',	'2024-12-01 04:59:13.575+00'),
('ddde9431-6384-4206-8d56-864a56863573',	'user33',	'user33@mail.com',	'2024-12-01 04:59:13.58+00',	'2024-12-01 04:59:13.58+00'),
('f56cb363-f016-4c0a-9cfb-6064480d343f',	'user34',	'user34@mail.com',	'2024-12-01 04:59:13.585+00',	'2024-12-01 04:59:13.585+00'),
('59aab6a3-c8b1-46bf-bb63-fcf5a95bfa6d',	'user35',	'user35@mail.com',	'2024-12-01 04:59:13.59+00',	'2024-12-01 04:59:13.59+00'),
('17ba967e-a9f4-4db1-b4b0-ed7d7c5c5968',	'user36',	'user36@mail.com',	'2024-12-01 04:59:13.595+00',	'2024-12-01 04:59:13.595+00'),
('807d388d-ed1f-41e6-8069-88148d88c28a',	'user37',	'user37@mail.com',	'2024-12-01 04:59:13.601+00',	'2024-12-01 04:59:13.601+00'),
('3e1103c7-93e5-460d-bab6-dff040c05336',	'user38',	'user38@mail.com',	'2024-12-01 04:59:13.607+00',	'2024-12-01 04:59:13.607+00'),
('a91b690a-8f26-4f62-b9f0-7271e6119740',	'user39',	'user39@mail.com',	'2024-12-01 04:59:13.611+00',	'2024-12-01 04:59:13.611+00'),
('adf4184b-950b-4f71-b890-27b958e94814',	'user40',	'user40@mail.com',	'2024-12-01 04:59:13.617+00',	'2024-12-01 04:59:13.617+00'),
('0cc62e75-7820-44bf-9eda-217996024698',	'user41',	'user41@mail.com',	'2024-12-01 04:59:13.622+00',	'2024-12-01 04:59:13.622+00'),
('75fd33ff-cc17-4844-8a3c-59779b496aca',	'user42',	'user42@mail.com',	'2024-12-01 04:59:13.627+00',	'2024-12-01 04:59:13.627+00'),
('b3afebb9-eaab-4917-822b-2f19dff0ed0b',	'user43',	'user43@mail.com',	'2024-12-01 04:59:13.633+00',	'2024-12-01 04:59:13.633+00'),
('d4ee5fd4-f8d8-4f34-870e-3b5cb6109278',	'user44',	'user44@mail.com',	'2024-12-01 04:59:13.638+00',	'2024-12-01 04:59:13.638+00'),
('a363f3b7-df44-477b-81c5-904533340733',	'user45',	'user45@mail.com',	'2024-12-01 04:59:13.643+00',	'2024-12-01 04:59:13.643+00'),
('c5e407de-27dc-415a-89da-bdeef6599b11',	'user46',	'user46@mail.com',	'2024-12-01 04:59:13.648+00',	'2024-12-01 04:59:13.648+00'),
('9b411061-4c05-48a9-805a-41d11bfead1b',	'user47',	'user47@mail.com',	'2024-12-01 04:59:13.655+00',	'2024-12-01 04:59:13.655+00'),
('00a21a54-3c19-49a5-a1ce-7d46281be516',	'user48',	'user48@mail.com',	'2024-12-01 04:59:13.661+00',	'2024-12-01 04:59:13.661+00'),
('c72f060b-a54a-44a1-a6ea-3157e7663361',	'user49',	'user49@mail.com',	'2024-12-01 04:59:13.666+00',	'2024-12-01 04:59:13.666+00'),
('24a1a28b-6ae3-4aa9-a96e-6ada2fc4b6a7',	'user50',	'user50@mail.com',	'2024-12-01 04:59:13.671+00',	'2024-12-01 04:59:13.671+00'),
('ecdd807b-4029-4cf2-8877-bb41c42077ed',	'user51',	'user51@mail.com',	'2024-12-01 04:59:13.676+00',	'2024-12-01 04:59:13.676+00'),
('596d0d7d-7b38-44fd-8661-a024e8cc434b',	'user52',	'user52@mail.com',	'2024-12-01 04:59:13.681+00',	'2024-12-01 04:59:13.681+00'),
('5f906677-e069-45a5-88a9-e8edb653d660',	'user53',	'user53@mail.com',	'2024-12-01 04:59:13.687+00',	'2024-12-01 04:59:13.687+00'),
('9ea4d7fc-a492-40b1-b583-6742c2872526',	'user54',	'user54@mail.com',	'2024-12-01 04:59:13.692+00',	'2024-12-01 04:59:13.692+00'),
('1ebf4632-b27c-400b-8d4c-7d3a3ff82484',	'user55',	'user55@mail.com',	'2024-12-01 04:59:13.698+00',	'2024-12-01 04:59:13.698+00'),
('90d5120f-e229-41a0-8da7-d42eab34bb68',	'user56',	'user56@mail.com',	'2024-12-01 04:59:13.704+00',	'2024-12-01 04:59:13.704+00'),
('86f007a3-45ba-4aff-9abc-b937097deefa',	'user57',	'user57@mail.com',	'2024-12-01 04:59:13.71+00',	'2024-12-01 04:59:13.71+00'),
('16e96934-a01a-434c-beb4-d403a2892b16',	'user58',	'user58@mail.com',	'2024-12-01 04:59:13.715+00',	'2024-12-01 04:59:13.715+00'),
('52e55968-121f-4648-97f8-7152531b103c',	'user59',	'user59@mail.com',	'2024-12-01 04:59:13.721+00',	'2024-12-01 04:59:13.721+00'),
('b30cc100-5e4f-44b1-b8b5-2d03e6de568d',	'user60',	'user60@mail.com',	'2024-12-01 04:59:13.727+00',	'2024-12-01 04:59:13.727+00'),
('8abbdd04-8486-4a0a-ae55-17796b1a942b',	'user61',	'user61@mail.com',	'2024-12-01 04:59:13.732+00',	'2024-12-01 04:59:13.732+00'),
('7eaf57ac-208e-4d83-bd4c-3e47b8e55dbb',	'user62',	'user62@mail.com',	'2024-12-01 04:59:13.737+00',	'2024-12-01 04:59:13.737+00'),
('755534c5-b86d-4652-a0fd-5027445cbf8d',	'user63',	'user63@mail.com',	'2024-12-01 04:59:13.742+00',	'2024-12-01 04:59:13.742+00'),
('9ef364ca-9328-4f6f-956b-e6600b419145',	'user64',	'user64@mail.com',	'2024-12-01 04:59:13.748+00',	'2024-12-01 04:59:13.748+00'),
('092d1bec-7559-41b1-87bf-512ce6b9f914',	'user65',	'user65@mail.com',	'2024-12-01 04:59:13.753+00',	'2024-12-01 04:59:13.753+00'),
('5662e07b-d811-4cc0-a5fe-46412e5de9e7',	'user66',	'user66@mail.com',	'2024-12-01 04:59:13.759+00',	'2024-12-01 04:59:13.759+00'),
('401c651d-bed9-4a20-a765-47c4cd8746a8',	'user67',	'user67@mail.com',	'2024-12-01 04:59:13.763+00',	'2024-12-01 04:59:13.763+00'),
('56f4f39a-3540-40ee-9bbc-e79e76161c0b',	'user68',	'user68@mail.com',	'2024-12-01 04:59:13.768+00',	'2024-12-01 04:59:13.768+00'),
('687e7f94-9af6-436c-8694-e7c5b8706940',	'user69',	'user69@mail.com',	'2024-12-01 04:59:13.774+00',	'2024-12-01 04:59:13.774+00'),
('b372f5f1-1b12-4a02-be5f-5febda81974c',	'user70',	'user70@mail.com',	'2024-12-01 04:59:13.779+00',	'2024-12-01 04:59:13.779+00'),
('5e7f7504-3bbd-452d-ac45-6d2e6f6f58a1',	'user71',	'user71@mail.com',	'2024-12-01 04:59:13.784+00',	'2024-12-01 04:59:13.784+00'),
('625cf71e-df6f-4b3a-a846-79bce7afe67e',	'user72',	'user72@mail.com',	'2024-12-01 04:59:13.789+00',	'2024-12-01 04:59:13.789+00'),
('ea3022d5-0a9f-46bd-9cb9-a54b516412f9',	'user73',	'user73@mail.com',	'2024-12-01 04:59:13.794+00',	'2024-12-01 04:59:13.794+00'),
('4e395427-44a3-4716-9bba-c46ef7390e7e',	'user74',	'user74@mail.com',	'2024-12-01 04:59:13.799+00',	'2024-12-01 04:59:13.799+00'),
('33726494-e82f-40b7-9e45-a0bad7d9b4fd',	'user75',	'user75@mail.com',	'2024-12-01 04:59:13.806+00',	'2024-12-01 04:59:13.806+00'),
('74d78a41-c37c-44b2-9b6d-d44b74a8f03b',	'user76',	'user76@mail.com',	'2024-12-01 04:59:13.811+00',	'2024-12-01 04:59:13.811+00'),
('2fd0c933-5e0a-43c9-9197-5b5b3f11da92',	'user77',	'user77@mail.com',	'2024-12-01 04:59:13.816+00',	'2024-12-01 04:59:13.816+00'),
('2abe049e-fa77-4843-8135-8771165f6b1f',	'user78',	'user78@mail.com',	'2024-12-01 04:59:13.821+00',	'2024-12-01 04:59:13.821+00'),
('3d2e9d9a-7840-46b0-ad8d-73ca196bc035',	'user79',	'user79@mail.com',	'2024-12-01 04:59:13.829+00',	'2024-12-01 04:59:13.829+00'),
('46cbdf8f-d299-4de1-98bb-8cb97f322ccf',	'user80',	'user80@mail.com',	'2024-12-01 04:59:13.836+00',	'2024-12-01 04:59:13.836+00'),
('5c4f7a5e-23a3-4367-8aa4-1b96f52f8845',	'user81',	'user81@mail.com',	'2024-12-01 04:59:13.843+00',	'2024-12-01 04:59:13.843+00'),
('0d4bec9a-1217-48d0-883e-bc1b039155bd',	'user82',	'user82@mail.com',	'2024-12-01 04:59:13.854+00',	'2024-12-01 04:59:13.854+00'),
('104a8658-1b16-43f6-b419-4ce11b25aa2c',	'user83',	'user83@mail.com',	'2024-12-01 04:59:13.862+00',	'2024-12-01 04:59:13.862+00'),
('b39f3da9-d876-45f1-bc3a-758bdeee1ff7',	'user84',	'user84@mail.com',	'2024-12-01 04:59:13.868+00',	'2024-12-01 04:59:13.868+00'),
('93c73998-063d-41f0-ae76-d38fe3207896',	'user85',	'user85@mail.com',	'2024-12-01 04:59:13.877+00',	'2024-12-01 04:59:13.877+00'),
('351d3fcc-7c38-4480-ab6e-7427b20c0b64',	'user86',	'user86@mail.com',	'2024-12-01 04:59:13.882+00',	'2024-12-01 04:59:13.882+00'),
('61ee3475-5275-4a1f-914b-54a79a9717d3',	'user87',	'user87@mail.com',	'2024-12-01 04:59:13.888+00',	'2024-12-01 04:59:13.888+00'),
('a56639e0-981c-4f2c-85f2-a8cf8a42104f',	'user88',	'user88@mail.com',	'2024-12-01 04:59:13.893+00',	'2024-12-01 04:59:13.893+00'),
('02922d09-a801-4347-a1a1-056a4f3f3823',	'user89',	'user89@mail.com',	'2024-12-01 04:59:13.898+00',	'2024-12-01 04:59:13.898+00'),
('a3f25044-5f0a-4dff-8913-bf49dbf8dda3',	'user90',	'user90@mail.com',	'2024-12-01 04:59:13.903+00',	'2024-12-01 04:59:13.903+00'),
('03ac21c5-b6c5-42e1-b82b-a24404e16000',	'user91',	'user91@mail.com',	'2024-12-01 04:59:13.908+00',	'2024-12-01 04:59:13.908+00'),
('090153bf-d6f2-42e5-8cae-862a13a85ff6',	'user92',	'user92@mail.com',	'2024-12-01 04:59:13.914+00',	'2024-12-01 04:59:13.914+00'),
('40b3a2e9-8198-41bc-aead-c33a17230a3e',	'user93',	'user93@mail.com',	'2024-12-01 04:59:13.919+00',	'2024-12-01 04:59:13.919+00'),
('9b8a06e2-3d52-4aef-81a5-6c7cccffb809',	'user94',	'user94@mail.com',	'2024-12-01 04:59:13.924+00',	'2024-12-01 04:59:13.924+00'),
('7bdea130-cae5-4d68-87ab-2ca0df9301c7',	'user95',	'user95@mail.com',	'2024-12-01 04:59:13.93+00',	'2024-12-01 04:59:13.93+00'),
('c0428ef4-0af3-4096-85e8-96fb6e175fff',	'user96',	'user96@mail.com',	'2024-12-01 04:59:13.935+00',	'2024-12-01 04:59:13.935+00'),
('8cb61663-5280-4af1-950d-f89b5be3bfcf',	'user97',	'user97@mail.com',	'2024-12-01 04:59:13.94+00',	'2024-12-01 04:59:13.94+00'),
('b9a8e342-7fc7-4a58-9347-f30e8013011a',	'user98',	'user98@mail.com',	'2024-12-01 04:59:13.945+00',	'2024-12-01 04:59:13.945+00'),
('c71df8c1-c620-4cd9-999b-fcc474708cdf',	'user99',	'user99@mail.com',	'2024-12-01 04:59:13.95+00',	'2024-12-01 04:59:13.95+00'),
('37a496ae-5fd1-45f4-8c07-f26373bf6b10',	'user100',	'user100@mail.com',	'2024-12-01 04:59:13.956+00',	'2024-12-01 04:59:13.956+00'),
('55b502c5-16b6-417b-8f5d-338bfc261bc7',	'user101',	'user101@mail.com',	'2024-12-01 04:59:13.961+00',	'2024-12-01 04:59:13.961+00'),
('0bd8197e-2c02-42fe-a414-9986945a1991',	'user102',	'user102@mail.com',	'2024-12-01 04:59:13.966+00',	'2024-12-01 04:59:13.966+00'),
('16e1b0b7-373c-48c2-babf-79aa49241ea2',	'user103',	'user103@mail.com',	'2024-12-01 04:59:13.971+00',	'2024-12-01 04:59:13.971+00'),
('b1d3e79b-aa2d-448c-9bfb-a96276e3c460',	'user104',	'user104@mail.com',	'2024-12-01 04:59:13.977+00',	'2024-12-01 04:59:13.977+00'),
('b5d68d6f-5886-48a0-8fc5-224df1f08499',	'user105',	'user105@mail.com',	'2024-12-01 04:59:13.981+00',	'2024-12-01 04:59:13.981+00'),
('409a7db2-2a54-4c00-ba03-9ec83fca3a07',	'user106',	'user106@mail.com',	'2024-12-01 04:59:13.986+00',	'2024-12-01 04:59:13.986+00'),
('1f2c1717-1071-49f7-9bc3-aadff0f353d0',	'user107',	'user107@mail.com',	'2024-12-01 04:59:13.992+00',	'2024-12-01 04:59:13.992+00'),
('5edb63a0-37a1-4f45-8574-1fcc3af0afb8',	'user108',	'user108@mail.com',	'2024-12-01 04:59:13.997+00',	'2024-12-01 04:59:13.997+00'),
('e556b8e5-e38e-4355-af14-dde5ce9fb9da',	'user109',	'user109@mail.com',	'2024-12-01 04:59:14.001+00',	'2024-12-01 04:59:14.001+00'),
('d3d685bc-7761-4c1b-9068-c695f79b0e3d',	'user110',	'user110@mail.com',	'2024-12-01 04:59:14.007+00',	'2024-12-01 04:59:14.007+00'),
('8df7e439-8fca-4a5e-963c-b01786a8d91a',	'user111',	'user111@mail.com',	'2024-12-01 04:59:14.012+00',	'2024-12-01 04:59:14.012+00'),
('c715685f-cc39-4854-b17a-acda59390147',	'user112',	'user112@mail.com',	'2024-12-01 04:59:14.017+00',	'2024-12-01 04:59:14.017+00'),
('8957c132-1abd-44e6-bbb1-df8d61801d61',	'user113',	'user113@mail.com',	'2024-12-01 04:59:14.023+00',	'2024-12-01 04:59:14.023+00'),
('7e71c2ab-96ed-4306-8324-6f8c35b18f9f',	'user114',	'user114@mail.com',	'2024-12-01 04:59:14.028+00',	'2024-12-01 04:59:14.028+00'),
('8fa50cd5-8330-4a29-9d74-c8ef782cd4ed',	'user115',	'user115@mail.com',	'2024-12-01 04:59:14.033+00',	'2024-12-01 04:59:14.033+00'),
('8fc1b2c9-c325-4317-8042-9fa66fea6195',	'user116',	'user116@mail.com',	'2024-12-01 04:59:14.039+00',	'2024-12-01 04:59:14.039+00'),
('57d4c2a1-c3fd-48a1-8372-d8bee87fe8c1',	'user117',	'user117@mail.com',	'2024-12-01 04:59:14.044+00',	'2024-12-01 04:59:14.044+00'),
('e7214a89-f370-4fe6-abf2-63d92cf53bb5',	'user118',	'user118@mail.com',	'2024-12-01 04:59:14.049+00',	'2024-12-01 04:59:14.049+00'),
('d58a3172-120f-4d94-a288-a508dc67333b',	'user119',	'user119@mail.com',	'2024-12-01 04:59:14.056+00',	'2024-12-01 04:59:14.056+00'),
('2f833886-0835-4d28-b781-81283b8e0eac',	'user120',	'user120@mail.com',	'2024-12-01 04:59:14.062+00',	'2024-12-01 04:59:14.062+00'),
('61ae9a84-dbba-4710-ac02-f9e9d077ebfb',	'user121',	'user121@mail.com',	'2024-12-01 04:59:14.067+00',	'2024-12-01 04:59:14.067+00'),
('84252d46-5c96-494d-92fe-f4caadb841ba',	'user122',	'user122@mail.com',	'2024-12-01 04:59:14.076+00',	'2024-12-01 04:59:14.076+00'),
('e3f2130d-b95b-4708-ba9b-406d81757c50',	'user123',	'user123@mail.com',	'2024-12-01 04:59:14.081+00',	'2024-12-01 04:59:14.081+00'),
('ff6b7d96-145d-460d-bd39-69d0e80a4cfc',	'user124',	'user124@mail.com',	'2024-12-01 04:59:14.086+00',	'2024-12-01 04:59:14.086+00'),
('22ef8840-2d02-452f-8ec9-572389d90ea4',	'user125',	'user125@mail.com',	'2024-12-01 04:59:14.091+00',	'2024-12-01 04:59:14.091+00'),
('216c99d7-8299-456d-926e-d2e41becee6c',	'user126',	'user126@mail.com',	'2024-12-01 04:59:14.096+00',	'2024-12-01 04:59:14.096+00'),
('84c31b7c-2c6b-4bb1-8f93-e71db76a6cd4',	'user127',	'user127@mail.com',	'2024-12-01 04:59:14.102+00',	'2024-12-01 04:59:14.102+00'),
('895f9ded-75c9-43c8-9890-a57cb95860d9',	'user128',	'user128@mail.com',	'2024-12-01 04:59:14.107+00',	'2024-12-01 04:59:14.107+00'),
('f566a45e-7ec7-42dd-b96a-ba951c746de6',	'user129',	'user129@mail.com',	'2024-12-01 04:59:14.112+00',	'2024-12-01 04:59:14.112+00'),
('65245b8f-a42e-432c-8f2b-e5dc819d416d',	'user130',	'user130@mail.com',	'2024-12-01 04:59:14.117+00',	'2024-12-01 04:59:14.117+00'),
('8aa8e9f2-510c-44f2-b4d2-c7ddfe7a005b',	'user131',	'user131@mail.com',	'2024-12-01 04:59:14.123+00',	'2024-12-01 04:59:14.123+00'),
('0d2a9d75-3390-492d-8110-d88fdb0e750a',	'user132',	'user132@mail.com',	'2024-12-01 04:59:14.128+00',	'2024-12-01 04:59:14.128+00'),
('a659359e-fe1f-4963-b00a-ad66d7c762e6',	'user133',	'user133@mail.com',	'2024-12-01 04:59:14.133+00',	'2024-12-01 04:59:14.133+00'),
('d0cf3103-1087-4807-9754-055c9526ebf7',	'user134',	'user134@mail.com',	'2024-12-01 04:59:14.138+00',	'2024-12-01 04:59:14.138+00'),
('ca42a2a8-6610-4339-b69c-a5fbc5aac108',	'user135',	'user135@mail.com',	'2024-12-01 04:59:14.143+00',	'2024-12-01 04:59:14.143+00'),
('f3244df2-3029-4c47-91dc-27d7c9238639',	'user136',	'user136@mail.com',	'2024-12-01 04:59:14.149+00',	'2024-12-01 04:59:14.149+00'),
('c9884a13-5bc8-4e18-bd21-9d09ee10c9c8',	'user137',	'user137@mail.com',	'2024-12-01 04:59:14.154+00',	'2024-12-01 04:59:14.154+00'),
('587c1561-bf34-412a-a5c5-d6a874d83a5f',	'user138',	'user138@mail.com',	'2024-12-01 04:59:14.159+00',	'2024-12-01 04:59:14.159+00'),
('9737b06b-2dc2-4ae5-bcb4-ccf9baeeb201',	'user139',	'user139@mail.com',	'2024-12-01 04:59:14.164+00',	'2024-12-01 04:59:14.164+00'),
('903b5c91-4b08-4f9a-bd38-6fa90393e3a0',	'user140',	'user140@mail.com',	'2024-12-01 04:59:14.17+00',	'2024-12-01 04:59:14.17+00'),
('318b193d-7aa8-4d7d-a47d-9d09efaa044f',	'user141',	'user141@mail.com',	'2024-12-01 04:59:14.175+00',	'2024-12-01 04:59:14.175+00'),
('37777fc3-4954-47b2-967d-873c6ba0ad5a',	'user142',	'user142@mail.com',	'2024-12-01 04:59:14.18+00',	'2024-12-01 04:59:14.18+00'),
('6fc40d7e-e3a3-4c9e-b084-dfa870a71006',	'user143',	'user143@mail.com',	'2024-12-01 04:59:14.185+00',	'2024-12-01 04:59:14.185+00'),
('84fed96f-8eb7-4034-a0d2-8cf96733e983',	'user144',	'user144@mail.com',	'2024-12-01 04:59:14.19+00',	'2024-12-01 04:59:14.19+00'),
('47a85375-2bed-45d0-a2c4-3de9a0327d49',	'user145',	'user145@mail.com',	'2024-12-01 04:59:14.195+00',	'2024-12-01 04:59:14.195+00'),
('6837319d-acaa-451e-985c-49ed2beea60b',	'user146',	'user146@mail.com',	'2024-12-01 04:59:14.2+00',	'2024-12-01 04:59:14.2+00'),
('5d3e0393-06de-4377-a203-cac9710e0bad',	'user147',	'user147@mail.com',	'2024-12-01 04:59:14.205+00',	'2024-12-01 04:59:14.205+00'),
('1daf9f63-19fd-4f83-b158-00a321c97baa',	'user148',	'user148@mail.com',	'2024-12-01 04:59:14.211+00',	'2024-12-01 04:59:14.211+00'),
('5ec75cb2-b222-420c-ab07-eb0a8107ad33',	'user149',	'user149@mail.com',	'2024-12-01 04:59:14.216+00',	'2024-12-01 04:59:14.216+00');

-- 2024-12-01 05:03:30.00965+00
