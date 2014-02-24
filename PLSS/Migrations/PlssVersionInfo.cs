using FluentMigrator.VersionTableInfo;

namespace PLSS.Migrations
{
    [VersionTableMetaData]
    public class PlssVersionInfo : IVersionTableMetaData, IVersionTableMetaDataExtended
    {
        public string TableName
        {
            get { return "PlssDatabaseVersion"; }
        }

        public string ColumnName
        {
            get { return "Version"; }
        }

        public string DescriptionColumnName { get { return "Description"; } }

        public string UniqueIndexName { get { return ""; } }

        public string SchemaName
        {
            get { return "PLSSADMIN"; }
        }

        public bool OwnsSchema
        {
            get { return false; }
        }
    }
}