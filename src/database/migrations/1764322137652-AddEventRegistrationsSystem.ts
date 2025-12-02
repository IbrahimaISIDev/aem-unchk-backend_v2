import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventRegistrationsSystem1764322137652 implements MigrationInterface {
    name = 'AddEventRegistrationsSystem1764322137652'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."event_registrations_status_enum" AS ENUM('confirmed', 'waitlist', 'cancelled', 'present', 'absent')`);
        await queryRunner.query(`CREATE TABLE "event_registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "registrationNumber" character varying(50) NOT NULL, "eventId" uuid NOT NULL, "userId" uuid, "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "university" character varying(150), "eno" character varying(100), "pole" character varying(100), "filiere" character varying(100), "level" character varying(50), "dietaryPreference" character varying(100), "allergies" text, "specialNeeds" text, "customResponses" jsonb, "status" "public"."event_registrations_status_enum" NOT NULL DEFAULT 'confirmed', "qrCodeUrl" character varying(500), "checkedInAt" TIMESTAMP, "checkedInBy" uuid, "cancelledAt" TIMESTAMP, "cancellationReason" text, "confirmationEmailSent" boolean NOT NULL DEFAULT false, "reminderJ7Sent" boolean NOT NULL DEFAULT false, "reminderJ1Sent" boolean NOT NULL DEFAULT false, "reminderDayOfSent" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b799a22e6d3b6763a0b1f4f9833" UNIQUE ("registrationNumber"), CONSTRAINT "PK_953d3b862c2487289a92b2356e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b799a22e6d3b6763a0b1f4f983" ON "event_registrations" ("registrationNumber") `);
        await queryRunner.query(`CREATE INDEX "IDX_5d3b46897573d1667b94a172d7" ON "event_registrations" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_d727b5cb9516d2fe450c6ee20b" ON "event_registrations" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a072346484fe1d7ee0fb9dfaa" ON "event_registrations" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e4e6dce237a527e4515f3d430f" ON "event_registrations" ("eventId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b308df020159fd5c476ace931d" ON "event_registrations" ("eventId", "userId") `);
        await queryRunner.query(`CREATE TABLE "event_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid NOT NULL, "program" text, "prerequisites" text, "speakers" jsonb, "partners" jsonb, "faqs" jsonb, "documents" jsonb, "customFormFields" jsonb, "confirmationMessage" text, "cancellationPolicy" text, "importantNotes" text, "videoUrl" character varying(500), "mapUrl" character varying(500), "contactEmail" character varying(255), "contactPhone" character varying(20), "contactName" character varying(100), "registrationOpenDate" TIMESTAMP, "registrationCloseDate" TIMESTAMP, "reservedSpots" integer, "enableWaitlist" boolean NOT NULL DEFAULT true, "allowCancellation" boolean NOT NULL DEFAULT true, "cancellationDeadlineHours" integer, "metadata" jsonb, CONSTRAINT "UQ_a12a77a97e985c8475f61991d3c" UNIQUE ("eventId"), CONSTRAINT "REL_a12a77a97e985c8475f61991d3" UNIQUE ("eventId"), CONSTRAINT "PK_e7753a530518edb90d77d0919a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."events_visibility_enum" AS ENUM('public', 'members_only', 'private')`);
        await queryRunner.query(`ALTER TABLE "events" ADD "visibility" "public"."events_visibility_enum" NOT NULL DEFAULT 'public'`);
        await queryRunner.query(`ALTER TABLE "events" ADD "shortDescription" character varying(300)`);
        await queryRunner.query(`ALTER TABLE "events" ADD "slug" character varying(250)`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "UQ_05bd884c03d3f424e2204bd14cd" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TYPE "public"."events_type_enum" RENAME TO "events_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."events_type_enum" AS ENUM('religious', 'pedagogical', 'social', 'humanitarian', 'sports', 'cultural', 'other', 'conference', 'workshop', 'prayer', 'study_circle', 'community_gathering', 'charity', 'ramadan', 'eid', 'hajj_umrah', 'online')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" TYPE "public"."events_type_enum" USING "type"::"text"::"public"."events_type_enum"`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" SET DEFAULT 'community_gathering'`);
        await queryRunner.query(`DROP TYPE "public"."events_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "event_registrations" ADD CONSTRAINT "FK_e4e6dce237a527e4515f3d430f1" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_registrations" ADD CONSTRAINT "FK_7a072346484fe1d7ee0fb9dfaa8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_registrations" ADD CONSTRAINT "FK_1bc960f1fb7a97a8e9fec239bc3" FOREIGN KEY ("checkedInBy") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_details" ADD CONSTRAINT "FK_a12a77a97e985c8475f61991d3c" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_details" DROP CONSTRAINT "FK_a12a77a97e985c8475f61991d3c"`);
        await queryRunner.query(`ALTER TABLE "event_registrations" DROP CONSTRAINT "FK_1bc960f1fb7a97a8e9fec239bc3"`);
        await queryRunner.query(`ALTER TABLE "event_registrations" DROP CONSTRAINT "FK_7a072346484fe1d7ee0fb9dfaa8"`);
        await queryRunner.query(`ALTER TABLE "event_registrations" DROP CONSTRAINT "FK_e4e6dce237a527e4515f3d430f1"`);
        await queryRunner.query(`CREATE TYPE "public"."events_type_enum_old" AS ENUM('charity', 'community_gathering', 'conference', 'eid', 'hajj_umrah', 'online', 'prayer', 'ramadan', 'study_circle', 'workshop')`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" TYPE "public"."events_type_enum_old" USING "type"::"text"::"public"."events_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "events" ALTER COLUMN "type" SET DEFAULT 'community_gathering'`);
        await queryRunner.query(`DROP TYPE "public"."events_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."events_type_enum_old" RENAME TO "events_type_enum"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "UQ_05bd884c03d3f424e2204bd14cd"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "shortDescription"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "visibility"`);
        await queryRunner.query(`DROP TYPE "public"."events_visibility_enum"`);
        await queryRunner.query(`DROP TABLE "event_details"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b308df020159fd5c476ace931d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e4e6dce237a527e4515f3d430f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a072346484fe1d7ee0fb9dfaa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d727b5cb9516d2fe450c6ee20b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d3b46897573d1667b94a172d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b799a22e6d3b6763a0b1f4f983"`);
        await queryRunner.query(`DROP TABLE "event_registrations"`);
        await queryRunner.query(`DROP TYPE "public"."event_registrations_status_enum"`);
    }

}
