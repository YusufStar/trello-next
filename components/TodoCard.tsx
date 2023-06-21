"use client"
import {DraggableProvidedDraggableProps, DraggableProvidedDragHandleProps} from "react-beautiful-dnd"
import {XCircleIcon} from "@heroicons/react/24/solid";
import {useBoardStore} from "@/store/BoardStore";
import {useEffect, useState} from "react";
import getUrl from "@/lib/getUrl";
import Image from "next/image";
import convertToClickableLink from "@/lib/convertText";

type Props = {
    todo: Todo;
    index: number;
    id: TypedColumn;
    innerRef: (element: HTMLElement | null) => void;
    draggableProps: DraggableProvidedDraggableProps;
    draggableHandleProps: DraggableProvidedDragHandleProps | null | undefined
}

export const TodoCard = ({ todo, index, id, innerRef, draggableProps, draggableHandleProps } : Props) => {
    const deleteTask =useBoardStore((state) => state.deleteTask)
    const [imgUrl, setImgUrl] = useState<string | null>(null)

    const getFileFunc = async () => {
        if (todo.image) {
            const res = await getUrl(todo.image!)
            if(res) {
                setImgUrl(res)
            }
        }
    }

    useEffect(() => {
        getFileFunc()
    }, [todo])

    return (
        <div {...draggableProps} {...draggableHandleProps} className="bg-white rounded-md space-y-2 drop-shadow-md" ref={innerRef}>

            <div className="flex justify-between items-center p-5">
                {convertToClickableLink(todo.title)}
                <button onClick={() => deleteTask(index, todo, id)} className="text-red-500 hover:text-red-600">
                    <XCircleIcon className="ml-5 h-8 w-8"/>
                </button>
            </div>

            {imgUrl && (
                <div className="h-full w-full rounded-b-md">
                    <Image src={imgUrl} width={400} height={200} className="w-full object-contain rounded-b-md"/>
                </div>
            )}
        </div>
    );
};
