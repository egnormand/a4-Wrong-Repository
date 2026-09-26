//Import react
import React, { useEffect, useState } from "react";


//Calc days left until due
function getDaysLeft(dueDate) {
    const [month, day, year] = dueDate.split("/").map(Number);

    const due = new Date(year, month - 1, day);

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return Math.round(
        (due - today) / (1000 * 60 * 60 * 24)
    );
}


//Task List functionality
function TaskList() {
    //get text in text inputs
    const [taskInput, setTaskInput] = useState("");

    const [dueDateInput, setDueDateInput] = useState("");

    const [tasks, setTasks] = useState(() => {
        const savedData = localStorage.getItem("tasks");

        return savedData ? JSON.parse(savedData) : [];
    });

    const [editingId, setEditingId] = useState(null);

    const [editText, setEditText] = useState("");

    //Save to local storage
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    //Add new task
    function addTask() {
        //Remove extra spaces
        const task = taskInput.trim();
        const dueDate = dueDateInput.trim();

        const dateParts = dueDate.split("/");

        const parsedDate =
            /^\d{2}\/\d{2}\/\d{4}$/.test(dueDate)
                ? new Date(
                    Number(dateParts[2]),
                    Number(dateParts[0]) - 1,
                    Number(dateParts[1])
                )
                : null;

        const validDate =
            parsedDate !== null &&
            parsedDate.getFullYear() === Number(dateParts[2]) &&
            parsedDate.getMonth() === Number(dateParts[0]) - 1 &&
            parsedDate.getDate() === Number(dateParts[1]);

        
        //No input errors
        if (task === "") {
            alert("Silly! You have to write a task!");
            return;
        }
        
        if (!validDate) {

            alert("Silly! You have to enter a valid due date!");

            return;
        }


        // Create a new task object.
        const newTask = {
            id: Date.now(),
            text: task,
            dueDate: dueDate,
            checked: false
        };

        setTasks((prevTasks) => [
            ...prevTasks,
            newTask
        ]);

        //clear input boxes
        setTaskInput("");
        setDueDateInput("");
    }

    //Enter key functionality
    function handleKeyDown(event) {
        if (event.key === "Enter") {
            addTask();
        }
    }

    //Due date formatting
    function handleDateInput(event) {
        const digits = event.target.value
            .replace(/\D/g, "")
            .slice(0, 8);

        const parts = [];

        if (digits.length > 0) {
            parts.push(digits.slice(0, 2));
        }

        if (digits.length > 2) {
            parts.push(digits.slice(2, 4));
        }

        if (digits.length > 4) {
            parts.push(digits.slice(4, 8));
        }

        setDueDateInput(parts.join("/"));
    }

    //Deleting a task
    function deleteTask(id) {
        setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== id)
        );
    }

    //Check/uncheck functionality
    function toggleChecked(id) {
        setTasks((prevTasks) =>
            prevTasks.map((task) => {

                if (task.id === id) {

                    return {
                        ...task,
                        checked: !task.checked
                    };
                }

                return task;
            })
        );
    }

    //Start editing a task functionality
    function startEditing(task) {
        setEditingId(task.id);
        setEditText(task.text);
    }

    //Stop editing a task functionality
    function finishEditing(id, save) {
        if (save && editText.trim() !== "") {
            setTasks((prevTasks) =>
                prevTasks.map((task) => {

                    if (task.id === id) {
                        return {
                            ...task,
                            text: editText.trim()
                        };
                    }

                    return task;
                })
            );
        }

        setEditingId(null);

        setEditText("");
    }

    //Page content
    return (
        <div className="container">
            <div className="todo-app">
                <h2 id="todo-header"><img src="/images/butterflyright.gif" alt="blue butterfly" /> To-Do List <img
                    src="/images/butterflyright.gif" alt="blue butterfly" /></h2>
                    <h3> Enter a Task: </h3>
                    <div className="row">
                        {/* Task input box */}
                        <input
                            id="input-box"
                            type="text"
                            placeholder="Enter a task"
                            value={taskInput}
                            onChange={(event) =>
                                setTaskInput(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                        />

                        {/* Due date input box */}
                        <input
                            id="due-date"
                            type="text"
                            placeholder="MM/DD/YYYY"
                            value={dueDateInput}
                            onChange={handleDateInput}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {/* Add Task button */}
                    <button onClick={addTask}> Add Task </button>

                    {/* Task List */}
                    <h3> Current Tasks:</h3>
                    <ul id="list-container">
                        {tasks.map((task) => {
                            {/* Task setup */}
                            const daysLeft = getDaysLeft(task.dueDate);
                            return (
                                <li
                                    key={task.id}
                                    data-due-date={task.dueDate}
                                    className={
                                        task.checked ? "checked" : ""
                                    }
                                    onDoubleClick={() =>
                                        startEditing(task)
                                    }
                                >
                            {/* Edit mode */}
                            {editingId === task.id ? (

                                <input
                                    type="text"
                                    className="edit-input"
                                    value={editText}
                                    autoFocus
                                    onChange={(event) =>
                                        setEditText(
                                            event.target.value
                                        )
                                    }
                                    onBlur={() =>
                                        finishEditing(
                                            task.id,
                                            true
                                        )
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            finishEditing(
                                                task.id,
                                                true
                                            );
                                        }
                                        if (event.key === "Escape") {

                                            finishEditing(
                                                task.id,
                                                false
                                            );
                                        }
                                    }}
                                />
                            ) : (
                                <span
                                    className="task-text"
                                    onClick={() =>
                                        toggleChecked(task.id)
                                    }
                                >
                                    {task.text}
                                </span>
                            )}
                            {/* Due date calc */}
                                <small className="due-countdown">
                                    {daysLeft < 0? (
                                        `Overdue by ${Math.abs(daysLeft)
                                        } day${Math.abs(daysLeft) === 1
                                            ? ""
                                            : "s"
                                        }`
                                    ): (
                                        `${daysLeft} day${daysLeft === 1
                                            ? ""
                                            : "s"
                                        } left`

                                    )}
                                </small>
                            {/* Delete button */}
                                <span className="delete-button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        deleteTask(task.id);
                                    }}
                                > X </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}


export default TaskList;
