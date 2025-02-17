/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
import * as React from 'react';
import { useLocation, useRouteMatch, Route } from 'react-router-dom';
import { ROUTE_PARTS } from '../../../constants/routes';
import { getDeviceIdFromQueryString, getInterfaceIdFromQueryString, getComponentNameFromQueryString, getModuleIdentityIdFromQueryString } from '../../../shared/utils/queryStringHelper';
import { getModelDefinitionAction } from '../actions';
import { PnpStateContextProvider } from '../../../shared/contexts/pnpStateContext';
import { DigitalTwinDetail } from './modelConfiguration/digitalTwinDetail';
import { useAsyncSagaReducer } from '../../../shared/hooks/useAsyncSagaReducer';
import { pnpReducer } from '../reducer';
import { pnpSaga } from '../saga';
import { pnpStateInitial } from '../state';
import { RepositoryLocationSettings } from '../../../shared/global/state';
import { useGlobalStateContext } from '../../../shared/contexts/globalStateContext';
import { getRepositoryLocationSettings } from '../../../modelRepository/dataHelper';
import { DigitalTwinInterfacesList } from './modelConfiguration/digitalTwinInterfacesList';
import { BreadcrumbRoute } from '../../../navigation/components/breadcrumbRoute';
import '../../../css/_digitalTwinInterfaces.scss';
import { dispatchGetTwinAction } from '../utils';

export const Pnp: React.FC = () => {
    const { search } = useLocation();
    const { url } = useRouteMatch();
    const deviceId = getDeviceIdFromQueryString(search);
    const moduleId = getModuleIdentityIdFromQueryString(search);
    const interfaceId = getInterfaceIdFromQueryString(search);
    const componentName = getComponentNameFromQueryString(search);

    const { globalState } = useGlobalStateContext();
    const { modelRepositoryState } = globalState;
    const locations: RepositoryLocationSettings[] = getRepositoryLocationSettings(modelRepositoryState);

    const [ pnpState, dispatch ] = useAsyncSagaReducer(pnpReducer, pnpSaga, pnpStateInitial(), 'pnpState');
    const twin = pnpState.twin.payload;
    const modelId = twin?.modelId;

    const interfaceIdModified = React.useMemo(() => interfaceId || modelId, [modelId, interfaceId]);
    const getModelDefinition = () => dispatch(getModelDefinitionAction.started({digitalTwinId: deviceId, interfaceId: interfaceIdModified, locations}));

    React.useEffect(() => {
        dispatchGetTwinAction(search, dispatch);
    },              [deviceId, moduleId]);

    React.useEffect(() => {
        if (interfaceIdModified && deviceId) {
            getModelDefinition();
        }
    },              [interfaceIdModified, deviceId]);

    return (
        <PnpStateContextProvider value={{ pnpState, dispatch, getModelDefinition }}>
            <Route path={url} exact={true} component={DigitalTwinInterfacesList}/>
            <BreadcrumbRoute
                path={`${url}/${ROUTE_PARTS.DIGITAL_TWINS_DETAIL}`}
                breadcrumb={{name: componentName}}
                children={<DigitalTwinDetail/>}
            />
        </PnpStateContextProvider>
    );
};
