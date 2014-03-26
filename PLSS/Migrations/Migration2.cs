using FluentMigrator;

namespace PLSS.Migrations
{
    [Migration(2, "add token to user column")]
    public class Migration2 : Migration
    {
        public override void Up()
        {
            Alter.Table("Users").InSchema("PLSSADMIN").AddColumn("Token").AsString(128).Nullable();
        }

        public override void Down()
        {
            Delete.Column("Users").FromTable("Coordinates").InSchema("PLSSADMIN");
        }
    }
}