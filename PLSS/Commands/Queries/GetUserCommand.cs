using System.Data;
using System.Data.SqlClient;
using System.Linq;
using CommandPattern;
using Dapper;
using PLSS.Models;

namespace PLSS.Commands.Queries
{
    public class GetUserCommand : Command<User>
    {
        private readonly SqlConnection _connection;
        private readonly string _name;
        private string _defaultFields = "UserId,UserName,SurveyorSeal,SurveryorLicenseNumber,FirstName,LastName";

        public string DefaultFields
        {
            get { return _defaultFields; }
            set { _defaultFields = value; }
        }

        public GetUserCommand(SqlConnection connection, string name)
        {
            _connection = connection;
            _name = name;
        }

        public override void Execute()
        {
            if (string.IsNullOrEmpty(_name))
            {
                return;
            }

            if (_connection.State != ConnectionState.Open)
            {
                _connection.Open();
            }

            Result = _connection.Query<User>(
                                    string.Format("SELECT TOP 1 {0} ", DefaultFields) +
                                    "FROM Users " +
                                    "WHERE UserName = @Name", new
                                    {
                                        name = _name
                                    }).SingleOrDefault();
        }

        public override string ToString()
        {
            return string.Format("{0}, Name: {1}", "GetUserCommand", _name);
        }
    }
}