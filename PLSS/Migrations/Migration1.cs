using FluentMigrator;

namespace PLSS.Migrations
{
    [Migration(1, "Move datum out of corner table and into grid and coordinate table")]
    public class Migration1 : Migration
    {
        public override void Up()
        {
            Alter.Table("Grids").InSchema("PLSSADMIN").AddColumn("Datum").AsString(32).Nullable();
            Alter.Table("Coordinates").InSchema("PLSSADMIN").AddColumn("Datum").AsString(32).Nullable();
        }

        public override void Down()
        {
            Delete.Column("Datum").FromTable("Grids").InSchema("PLSSADMIN");
            Delete.Column("Datum").FromTable("Coordinates").InSchema("PLSSADMIN");
        }
    }
}