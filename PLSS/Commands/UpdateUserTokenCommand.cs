using System.Data;
using CommandPattern;
using Dapper;
using PLSS.Models;

namespace PLSS.Commands
{
    public class UpdateUserTokenCommand : Command<TokenContainer>
    {
        private readonly IDbConnection _connection;
        private readonly User _user;
        private TokenContainer _token;

        public UpdateUserTokenCommand(IDbConnection connection, User user)
        {
            _connection = connection;
            _user = user;
        }

        public override void Execute()
        {
            var token = CommandExecutor.ExecuteCommand(new GenerateTokenCommand());

            _user.Token = token.Token;
            _connection.Execute("update Users SET Token = @token where UserId = @UserId", new { token.Token, _user.UserId });

            _token = token;
            Result = _token;
        }

        public override string ToString()
        {
            return string.Format("{0}, User: {1}, Token: {2}", "UpdateUserTokenCommand", _user, _token);
        }
    }
}