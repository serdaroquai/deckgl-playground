import { useState, useEffect, useRef } from "react";

export function useFetchBlob(url, dependencies) {
    const [data, setData] = useState();

    useEffect(() => {
        async function fetchData() {
            const resp = await fetch(url);
            const blob = await resp.arrayBuffer();
            setData(blob);
        }

        fetchData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies]);

    return data;
}

export function useFetchJson(url, dependencies) {
    const [data, setData] = useState();

    useEffect(() => {
        async function fetchData() {
            const resp = await fetch(url);
            const json = await resp.json();
            setData(json);
        }

        fetchData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies]);

    return data;
}

export function useAnimationFrame(callback) {
    const requestRef = useRef();

    useEffect(() => {
        function animate(time) {
            callback(time);
            requestAnimationFrame(animate);
        }
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);

    }, [callback]);
}