'use client'
import {DragDropContext, Droppable, DropResult} from "react-beautiful-dnd";
import {useEffect} from "react";
import {useBoardStore} from "@/store/BoardStore";
import {Column} from "@/components/Column";
import {start} from "repl";
import fnv1a from "next/dist/shared/lib/fnv1a";

export const Board = () => {
    const [board, getBoard, setBoardState, updateTodoInDB] = useBoardStore((state) => [state.board, state.getBoard, state.setBoardState, state.updateTodoInDB])

    useEffect(() => {
        getBoard();
    }, [getBoard]);

    const handleOnDragEnd = (res : DropResult) => {
        const {destination, source, type} = res;

        if (!destination) return true;

        if(type === "column") {
            console.log("col change")
            const entries = Array.from(board.columns.entries());
            const [removed] = entries.splice(source.index, 1);
            entries.splice(destination.index, 0, removed);
            const rearrangedCol = new Map(entries);
            setBoardState({
                ...board,
                columns: rearrangedCol
            })
        }

        const columns = Array.from(board.columns);
        const startColumns = columns[Number(source.droppableId)]
        const finishColumns = columns[Number(destination.droppableId)]

        const startCol = {
            id: startColumns[0],
            todos: startColumns[1].todos,
        }

        const finishCol = {
            id: finishColumns[0],
            todos: finishColumns[1].todos,
        }

        if (!startCol || !finishCol) return;

        if (source.index === destination.index && startCol === finishCol) return;

        const newTodos = startCol.todos;
        const [todoMoved] = newTodos.splice(source.index, 1)

        if (startCol.id === finishCol.id) {
            newTodos.splice(destination.index, 0, todoMoved);

            const newCol = {
                id: startCol.id,
                todos: newTodos,
            };

            const newColumns = new Map(board.columns);
            newColumns.set(startCol.id, newCol)

            setBoardState({ ...board, columns: newColumns });
        } else {
            const finishTodos = Array.from(finishCol.todos);
            finishTodos.splice(destination.index, 0, todoMoved);

            const newColumns = new Map(board.columns);

            const newCol = {
                id: startCol.id,
                todos: newTodos,
            };

            newColumns.set(startCol.id, newCol);
            newColumns.set(finishCol.id, {
                id: finishCol.id,
                todos: finishTodos,
            });

            updateTodoInDB(todoMoved, finishCol.id)

            setBoardState({ ...board, columns: newColumns })
        }
    }

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="column">
                {(provided) => <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto">{
                    Array.from(board.columns.entries()).map(([id, column], index) => (
                        <Column key={id} id={id} todos={column.todos} index={index} />
                    ))
                }</div>}
            </Droppable>
        </DragDropContext>
    );
};
