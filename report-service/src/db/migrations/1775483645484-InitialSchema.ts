import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1775483645484 implements MigrationInterface {
    name = 'InitialSchema1775483645484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text NOT NULL, "storageKey" character varying NOT NULL, "originalFileName" character varying NOT NULL, "mimeType" text, "size" integer NOT NULL, "fileUrl" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" character varying NOT NULL, CONSTRAINT "UQ_19d2f880ef5492aebe4572be3c2" UNIQUE ("storageKey"), CONSTRAINT "PK_515948649ce0bbbe391de702ae5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "templates"`);
    }

}
