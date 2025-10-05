import { Button } from "@/components/ui/button";

const longFetch = async () => {
  const myPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve("working");
    }, 1000 * 2);
  });

  return myPromise.then((data) => data);
};

async function SlowComponent() {
  const data = await longFetch();
  return <div>Data: {JSON.stringify(data)}</div>;
}

export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Button>Hello</Button>
    </div>
  );
}
