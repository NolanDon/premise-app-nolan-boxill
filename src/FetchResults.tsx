import {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';

enum STATUS {
    LOADING,
    SUCCESS,
    FAILURE
}

interface StatusObject {
    activeStatus: STATUS
}

export const FetchResults = (prop: {id: string}) => {
    const [status, setStatus] = useState<StatusObject>({activeStatus: STATUS.LOADING})
    const [yearCreated, setYearCreated] = useState("")
    const [image, setImage] = useState(undefined)
    const [artistName, setArtistName] = useState("")
    const [title, setTitle] = useState("")

    const axiosCall = (url: string) => {

        return new Promise((resolve, reject) => {
            axios.get(url).then(response => {

                resolve(response)

            }).catch((error) => {

                reject('bad request on id: ' + prop.id +  ' with error::' + error)
                setStatus({activeStatus: STATUS.FAILURE})
            })
        })
    }

    useEffect(() => {

        // GET
        const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${prop.id}`

        axiosCall(url).then((response: any) => {
            
            if (response && response.data) {

                // SET STATE FROM RESPONSE
                setStatus({activeStatus: STATUS.SUCCESS})
                setYearCreated(response.data.objectBeginDate)
                setImage(response.data.primaryImageSmall)
                setArtistName(response.data.artistDisplayName)
                setTitle(response.data.title)
            }
        })
    },[])
    
    const awaitResponse = (value: JSX.Element | string | null) => {
        switch (status.activeStatus) {
            case STATUS.FAILURE:
                return 'Not available'
            case STATUS.LOADING:
                return 'Loading...'
            case STATUS.SUCCESS:
                return value
            default:
                return 'N/A'
        }
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    <th scope="col">Image</th>
                    <th scope="col">Title</th> 
                    <th scope="col">Year created</th>
                    <th scope="col">Artist</th>
                </tr>
                <tr>
                    <td>{ awaitResponse(<img src={image} alt="artists painting" className="img"/>)}</td>
                    <td>{ awaitResponse(title)}</td>
                    <td>{ awaitResponse(yearCreated)}</td>
                    <td>{ awaitResponse(artistName)}</td>
                </tr>
            </thead>
      </table>
    )
}