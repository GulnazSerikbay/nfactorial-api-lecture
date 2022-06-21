import {useEffect, useState} from "react";
import "./App.css";
import axios from "axios";
import { TodoistApi } from '@doist/todoist-api-typescript'

const BACKEND_URL = "http://10.65.132.54:3000";

/*
* Plan:
*   1. Define backend url
*   2. Get items and show them +
*   3. Toggle item done +
*   4. Handle item add +
*   5. Delete +
*   6. Filter
*
* */

const token = '2545a8f4423994ed282c972d6cf55d990473e5dd'
const api = new TodoistApi(token)




function App() {
  const [itemToAdd, setItemToAdd] = useState("");
  const [items, setItems] = useState([]);
  const [doneItems, setDoneItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const handleChangeItem = (event) => {
    setItemToAdd(event.target.value);
  };

  const handleAddItem = () => {
    api.addTask({
      content: itemToAdd,
      completed:false,
      //order: 1
    })
      .then((task) => {
        setItems([ task, ...items]);
        setItemToAdd("");
      }
      )
      .catch((error) => console.log(error))
  };

  
    

  const toggleItemDone = (thisItem) => {
    if (thisItem.completed_date) {
      api.reopenTask(thisItem.task_id)
        .then((task) => {
          axios.get('https://api.todoist.com/sync/v8/completed/get_all', {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          })
          .then((res) => { setDoneItems(res.data.items) })
          .catch((error) => { console.error(error) })
        }
        )
        .catch((error) => console.log(error))
    }
    else{
      api.closeTask(thisItem.id)
      .then((isSuccess) => {
      console.log("closed task");
      axios.get('https://api.todoist.com/sync/v8/completed/get_all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
        })
        .then((res) => {setDoneItems(res.data.items) })
        .catch((error) => { console.error(error) })
      })
      .catch((error) => console.log("error in close"))
    }


    setItems(items.map((item) => {
      if (item.id === thisItem.task_id) {
          
          return {
              ...item,
              completed: !thisItem.completed
          }
      }
      return item
    }))


  };

  
 

  // N => map => N
    // N => filter => 0...N
  const handleItemDelete = (id) => {
    api.deleteTask(id).then((response) => {
          const deletedItem = response.data;
          console.log('Было:',items)
          const newItems = items.filter((item) => {
              return deletedItem.task_id
          })
          console.log('Осталось:',newItems)
          setItems(newItems)
      })
  };

  useEffect(() => {
      api.getTasks()
        .then((tasks) => {
          setItems(tasks); //filter by search value?
      })
        .catch((error) => console.log(error))

      axios.get('https://api.todoist.com/sync/v8/completed/get_all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
        })
      .then((res) => { 
          setDoneItems(res.data.items) })
      .catch((error) => { console.error(error) })
      },[searchValue, doneItems.length])
     



  return (
    <div className="todo-app">
      {/* App-header */}
      <div className="app-header d-flex">
        <h1>Todo List</h1>
      </div>

      <div className="top-panel d-flex">
        {/* Search-panel */}
        <input
          type="text"
          className="form-control search-input"
          placeholder="type to search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />
      </div>

      {/* List-group */}
      <ul className="list-group todo-list">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item.id} className="list-group-item">
              <span className={`todo-list-item${item.completed ? " done" : ""}`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => toggleItemDone(item)}
                >
                  {item.content}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-success btn-sm float-right"
                >
                  <i className="fa fa-exclamation" />
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm float-right"
                  onClick={() => handleItemDelete(item.id)}
                >
                  <i className="fa fa-trash-o" />
                </button>
              </span>
            </li>
          ))
        ) : (
          <div>No todos🤤</div>
          
        )}
      </ul>

      {/* Add form */}
      <div className="item-add-form d-flex">
        <input
          value={itemToAdd}
          type="text"
          className="form-control"
          placeholder="What needs to be done"
          onChange={handleChangeItem}
        />
        <button className="btn btn-outline-secondary" onClick={handleAddItem}>
          Add item
        </button>


      </div>
      {/* List-group */}
      <ul className="list-group todo-list" >
        {doneItems.length > 0 ? (
          doneItems.map((item) => (
            <li key={item.id} className="list-group-item">
              <span className={`todo-list-item done`}>
                <span
                  className="todo-list-item-label"
                  onClick={() => toggleItemDone(item)}
                >
                  {item.content}
                </span>
              </span>
            </li>
          ))
        ) : (
          <div>No todos🤤</div>
          
        )}
      </ul>
    </div>
  );
}

export default App;
