import {useRef, useEffect, useState} from 'react';
import axios from 'axios';
import { FetchResults } from './FetchResults'

export const App = () => {

let [idList, addToIDList] = useState<IDList>([])
const inputRef = useRef<HTMLInputElement | null>(null);
const [searchValue, setSearchValue] = useState("")
const [toast, showToast] = useState({message: '', active: false})


interface IDList extends Array<string>{}

const handleSearchClick= () => {
  if (null !== inputRef.current) {
    setSearchValue(inputRef.current.value);
  } 
}

// TODO: MOVE AXIOS CALL TO OWN COMPONENT
const axiosCall = (url: string) => {

  return new Promise((resolve, reject) => {

    axios.get(url)

    .then(response => {
      resolve(response)
    }).catch((error) => {
      reject('axiosCall => ' + error)
    })
  })
}

// TODO: CREATE TOAST COMPONENT 
const showToastError = (message: string) => {

  showToast({message: message, active: true})

  let count = 0;

  let interval = setInterval(function(){
    if (count >= 5){
      clearInterval(interval)
      showToast({message: '', active: false})
    }

    count ++
  }, 1000);
}


useEffect(() => {

  // RESET LIST
  if (searchValue !== null) {
    idList = []
  }

  const RESULT_LIMIT = 1000;
  const SEARCH_VALUE = searchValue;
  const BASE_URL = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${SEARCH_VALUE}`;

   axiosCall(BASE_URL).then((response:any) => {

    const RESULTS_TOTAL = response.data.total; 

    // LIMIT RESULTS
    if (RESULTS_TOTAL > RESULT_LIMIT) {
      showToastError('too many search results, please be more specific with request')
      return;
    }

    const responseIDs: Array<string> = []

    response.data.objectIDs.map((e: string): void => {
      responseIDs.push(e)
    })

    addToIDList(responseIDs)
   })
  },[searchValue])

  return (
    <div className="App">
        <div className="wrap">
          <div className="search">
            {toast.active ? <div className="warning">{toast.message}</div> : <></>}
            <input type="text" 
              ref={inputRef}
              className="searchTerm" 
              placeholder="Search by artist, or title, eg: 'Van Gogh'" />
            <button data-testid="submit" type="submit" className="searchButton" onClick={handleSearchClick}>
              <i className="fa fa-search"></i>search
            </button>
          </div>
        </div>
      <div className="resultWrapper">
      {idList.map((id: string) => (
          <FetchResults id={id} />
        ))}
      </div>
    </div>
  );
}


