using System.Threading.Tasks;

namespace CommandPattern
{
    public class CommandExecutor
    {
        /// <summary>
        /// Executes the command.
        /// </summary>
        /// <param name="cmd">The CMD.</param>
        public static void ExecuteCommand(Command cmd)
        {
            cmd.Run();
        }


        /// <summary>
        ///     Executes the command for commands with a result.
        /// </summary>
        /// <typeparam name="TResult">The type of the result.</typeparam>
        /// <param name="cmd">The CMD.</param>
        /// <returns></returns>
        public static TResult ExecuteCommand<TResult>(Command<TResult> cmd) where TResult : class
        {
            cmd.Run();

            return cmd.Result;
        }

        /// <summary>
        /// Executes the command async.
        /// </summary>
        /// <typeparam name="TResult">The type of the result.</typeparam>
        /// <param name="cmd">The CMD.</param>
        /// <returns></returns>
        public static async Task<TResult> ExecuteCommandAsync<TResult>(CommandAsync<TResult> cmd) where TResult : class
        {
            return await cmd.Run();
        }

        /// <summary>
        /// Executes the command async.
        /// </summary>
        /// <typeparam name="TResult">The type of the result.</typeparam>
        /// <param name="cmd">The CMD.</param>
        /// <returns></returns>
        public static async Task<bool> ExecuteCommandAsync(CommandAsync cmd)
        {
            return await cmd.Run();
        }
    }
}