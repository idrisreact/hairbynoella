"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { CustomInput } from "../ui/input";
import { Task } from "@/src/types";

export function TaskManagement() {
  const [task, setTask] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [debounceValue, setDebounceValue] = useState("");

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    const created_at = new Date();

    const newTask: Task = {
      id: `${debounceValue}-${created_at}`,
      task: debounceValue,
      created_at,
      isCompleted: false,
    };
    setTask((prevTasks) => [...prevTasks, newTask]);
    setText("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(text);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [text]);
  return (
    <>
      <h1 className="text-3xl">Task Manager</h1>
      <form onSubmit={submitHandler}>
        <div className="max-w-1/2">
          <CustomInput
            label="Add Task"
            value={text}
            name="task"
            placeholder="add task.."
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setText(e.target.value)
            }
          />
          <button
            type="submit"
            className="bg-blue-600 mt-5 rounded-md px-6 py-3 cursor-pointer"
          >
            Add Task
          </button>
        </div>
        <div className="mt-20">
          {task.length > 0 ? <h2>Task</h2> : <h2>No task added</h2>}
          {task.map((t) => (
            <div key={t.id}>
              <p>{t.task}</p>
            </div>
          ))}
        </div>
      </form>
    </>
  );
}
