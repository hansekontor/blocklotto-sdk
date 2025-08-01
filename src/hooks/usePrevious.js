/**
 * This file is part of the BlockLotto core functionality.
 * 
 * DO NOT EDIT THIS FILE DIRECTLY.
 * Any changes to this file may cause unexpected behavior.
 * Please consult the project maintainers before making modifications.
*/

import { useRef, useEffect } from 'react';

export const usePrevious = value => {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes

    // Return previous value (happens before update in useEffect above)
    // console.log("usePrevious return ref.current", ref.current);
    return ref.current;
};

export default usePrevious;
