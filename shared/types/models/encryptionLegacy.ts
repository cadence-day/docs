// Manual type definition for encryption_legacy table
// NOTE: This type definition is a temporary stand-in and should be replaced with an auto-generated type.
// When the database schema changes, or when running the type generation script (e.g., `yarn db:generate-types`),
// this file should be updated or removed in favor of the generated type from the database models.
// See docs/development/database-types.md for details on the regeneration process.
export type EncryptionLegacy = {
    encryption_key: string | null;
    user_id: string | null;
    legacy_email?: string | null;
};

export default EncryptionLegacy;
