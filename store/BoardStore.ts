import { create } from "zustand";
import {getTodosGroupedByColumn} from "@/lib/getTodosGroupedByColumn";
import {databases, ID, storage} from "@/appwrite";
import Image from "next/image";
import uploadImage from "@/lib/uploadImage";

interface BoardState {
    board: Board;
    getBoard: () => void;
    setBoardState: (board: Board) => void;
    updateTodoInDB: (todo: Todo, columnId: TypedColumn) => void;

    newTaskInput: string;
    setNewTaskInput: (taskInput: string) => void;

    searchString: string;
    setSearchString: (searchString: string) => void;

    deleteTask: (taskIndex: number, todoId: Todo, id: TypedColumn) => void;

    newTaskType: TypedColumn;
    setNewTaskType: (columnId: TypedColumn) => void;

    image: File | null;
    setImage: (image: File | null) => void;

    addTask: (todo:string, columnId: TypedColumn, image?: File | null) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
    board: {
        columns: new Map<TypedColumn, Column>()
    },
    newTaskInput: "",
    setNewTaskInput: (taskInput: string) => set({ newTaskInput: taskInput }),
    searchString: "",
    setSearchString: (searchString) => set({ searchString }),
    getBoard: async() => {
        const board = await getTodosGroupedByColumn();
        set({ board })
    },
    updateTodoInDB: async(todo, columnId) => {
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_TODOS_DOCUMENT_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            todo.$id,
            {
                title: todo.title,
                status: columnId,
            }
        )
    },

    deleteTask: async (taskIndex: number, todo: Todo, id: TypedColumn) => {
        const newCol = new Map(get().board.columns)
        newCol.get(id)?.todos.splice(taskIndex, 1);
        set({ board: { columns: newCol} });

        if(todo.image) {
            await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
        }

        await databases.deleteDocument(
            process.env.NEXT_PUBLIC_TODOS_DOCUMENT_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            todo.$id
        )
    },

    newTaskType: "todo",
    setNewTaskType: (id: TypedColumn) => set({ newTaskType: id }),

    image: null,
    setImage: (image: File | null) => set({ image }),

    addTask: async (todo:string, columnId: TypedColumn, image?: File | null) => {
        let file: Image | undefined;

        if(image) {
            const fileUploaded = await uploadImage(image)
            if(fileUploaded) {
                file = {
                    bucketId: fileUploaded.bucketId,
                    fileId: fileUploaded.$id,
                }
            }
        }

        const {$id} = await databases.createDocument(
            process.env.NEXT_PUBLIC_TODOS_DOCUMENT_ID!,
            process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
            ID.unique(),
            {
                title: todo,
                status: columnId,
                ...(file && { image: JSON.stringify(file) }),
            }
        );

        set({ newTaskInput: "" });

        set((state) => {
            const newCol = new Map(state.board.columns);

            const newTodo: Todo = {
                $id,
                $createdAt: new Date().toISOString(),
                title: todo,
                status: columnId,
                ...(file && {image: file}),
            };

            const col =  newCol.get(columnId);

            if(!col) {
                newCol.set(columnId, {
                    id: columnId,
                    todos: [newTodo],
                });
            } else {
                newCol.get(columnId)?.todos.push(newTodo)
            }

            return {
                board: {
                    columns: newCol,
                }
            }
        })
    },

    setBoardState: (board) => set({ board }),
}))