import {useRef, useEffect, useState} from 'react';
import axios from 'axios';
import { FetchResults } from './FetchResults'

export const App = () => {
  const [toast, showToast] = useState({message: '', active: false})
  const [readyToSearch, searchBtnEnabled] = useState<boolean>(true)
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState("")
  let [tables, assignNewTables] = useState<any[]>([])
  let [idList, addToIDList] = useState<IDList>([])
  let [currentIndex, setNewIndex] = useState<Array<number>>([0,4])

  type IDList = Array<string>

  const debounceSearchButton = () => {
    searchBtnEnabled(false)
    let count = 0;

    let interval = setInterval(() => {
      if (count >= 10){
        searchBtnEnabled(true)
        clearInterval(interval)
      }
      count ++
    }, 1000);
  }

  const handleSearchClick = () => {
    if (null !== inputRef.current) {
      debounceSearchButton();
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
        reject(error)
      })
    })
  }

  // TODO: MOVE SHOW TOAST TO OWN COMPONENT
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

    if (searchValue !== "") {

      setNewIndex([0,4])
      addToIDList([])

      const RESULT_LIMIT = 1000;
      const SEARCH_VALUE = searchValue;
      const BASE_URL = `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${SEARCH_VALUE}`;

      axiosCall(BASE_URL).then((response:any) => {

        // LIMIT RESULTS
        if (response.data.total > RESULT_LIMIT) {
          showToastError('too many search results, please be more specific with request')
          searchBtnEnabled(true)
          return;
        }

        const responseIDs: Array<string> = []

        response.data.objectIDs.map((e: string): void => {
          responseIDs.push(e)
        })

        addToIDList(responseIDs)
      })
    }

  },[searchValue])

  const getIdsOf = (): string[]  => {

    let ids: string[] = []
    let i = 0;

    if (idList.length > 0) {
      while(i <= currentIndex[1]) {
          ids.push(idList[i])
          i++
      }
    }

    return ids;
   }

  const fetchResults = (): any[] => {

    let firstResults: any[] = getIdsOf()
    
    if (firstResults.length > 0) {
      tables = firstResults.map((id: string) => (
        <FetchResults id={id} />
      ))
    }

    return tables;
  }

  const handleShowMore = () => {

    setNewIndex([currentIndex[0], currentIndex[1] + 10])

    let results: any[] = getIdsOf()
    let newIds: any[] = [];

    newIds = results.map((id: string) => (
      <FetchResults id={id} />
    ))
    
    let verifyTables: any[] = [...tables, newIds]
  
    assignNewTables(verifyTables)
    
  }

  return (
    <div className="App">
        <div className="wrap">
          <div className="search">
            <input type="text" ref={inputRef} className={"searchTerm"} placeholder="Search by artist, or title, eg: 'Van Gogh'" />
            <button disabled={!readyToSearch} type="submit" className={readyToSearch ? "searchButton" : "searchButtonDisabled"} onClick={handleSearchClick}>
              {readyToSearch ? 'search' : '...'}
            </button>
          </div>
          {toast.active ? <div className="warning">{toast.message}</div> : <div></div>}
        </div>
      <div className="resultWrapper">
      {fetchResults()}
      {idList.length > 0 ? 
      <div className="center">
        <button type="submit" className="center" onClick={handleShowMore} >
          {'show more'}
        </button>
      </div>
     : <></> }
      </div>
    </div>
  );
}


