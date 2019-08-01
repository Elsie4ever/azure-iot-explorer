/***********************************************************
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License
 **********************************************************/
import { ModelDefinition } from './../../../../api/models/modelDefinition';
import { PropertyContent, ContentType } from '../../../../api/models/modelDefinition';
import { StateType } from '../../../../shared/redux/state';
import { parseInterfacePropertyToJsonSchema } from '../../../../shared/utils/jsonSchemaAdaptor';
import { getModelDefinitionSelector, getInterfaceNameSelector } from '../../selectors';
import { DeviceInterfaceWithSchema } from './deviceSettings';
import { generateDigitalTwinForSpecificProperty } from './../deviceProperties/selectors';

export const getDeviceSettingTupleSelector = (state: StateType) => {
    const modelDefinition = getModelDefinitionSelector(state);
    return modelDefinition && generateTwinSchemaAndInterfaceTuple(state, modelDefinition);
};

const generateTwinSchemaAndInterfaceTuple = (state: StateType, model: ModelDefinition): DeviceInterfaceWithSchema => {
    const writableProperties = model && model.contents && model.contents.filter((item: PropertyContent) => filterProperties(item)) as PropertyContent[];

    const settings = writableProperties && writableProperties
        .map(setting => {
            const property = generateDigitalTwinForSpecificProperty(state, setting);
            return {
                desiredTwin: property && property.desired && property.desired.value,
                reportedTwin: property && property.reported,
                settingModelDefinition: setting,
                settingSchema: parseInterfacePropertyToJsonSchema(setting),
                syncStatus: undefined // todo
            };
        });

    return {
        interfaceId: model['@id'],
        interfaceName: getInterfaceNameSelector(state),
        twinWithSchema: settings,
    };
};

const filterProperties = (content: PropertyContent) => {
    if (typeof content['@type'] === 'string') {
        return content['@type'].toLowerCase() === ContentType.Property && content.writable;
    }
    else {
        return content['@type'].some((entry: string) => entry.toLowerCase() === ContentType.Property) && content.writable;
    }
};
