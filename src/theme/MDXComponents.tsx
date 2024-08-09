// import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import DefinitionList from '../components/DefinitionList';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

export default {
    // Re-use the default mapping
    ...MDXComponents,
    Dl: DefinitionList,
    Tabs: Tabs,
    TabItem: TabItem,
};
