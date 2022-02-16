import React, { useState } from 'react';

const ApplicationContext = React.createContext();

export const ApplicationProvider = ({ children }) => {
    const [appRootFolderId, setAppRootFolderId] = useState('');

    const updateAppRootFolderId = (appRootFolderId) => {
        setAppRootFolderId(appRootFolderId);
    }

    return <ApplicationContext.Provider value={{ appRootFolderId: appRootFolderId, updateAppRootFolderId }}>
        {children}
    </ApplicationContext.Provider>;
}

export default ApplicationContext;
