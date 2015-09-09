namespace CommandPattern
{
    public abstract class Command<T> : Command where T : class
    {
        public T Result { get; protected set; }
    }

    public abstract class Command
    {
        public abstract void Execute();

        public abstract override string ToString();

        public virtual void Run()
        {
            Execute();
        }
    }
}
