// app/page.tsx
import { revalidatePath } from "next/cache";
import { AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";
import Logout from "@/components/Logout";
import { fetchAuthSession } from 'aws-amplify/auth';


async function App() {
  const session = await fetchAuthSession();
  const groups = session.tokens?.accessToken.payload['cognito:groups'] || [];
  console.log('User groups:', groups);

  const user = await AuthGetCurrentUserServer();
  const { data: todos } = await cookiesClient.models.Channel.list();

  async function addTodo(data: FormData) {
    "use server";
    const title = data.get("title") as string;
    await cookiesClient.models.Channel.create({
      channel_type: title,
    });
    revalidatePath("/");
  }

  return (
    <>
      <h1>Hello, Amplify 👋</h1>
      {user && <Logout />}
      <form action={addTodo}>
        <input type="text" name="title" />
        <button type="submit">Add Todo</button>
      </form>

      <ul>
        {todos && todos.map((todo) => <li key={todo.id}>{todo.channel_type}</li>)}
      </ul>
    </>
  );
}

export default App;