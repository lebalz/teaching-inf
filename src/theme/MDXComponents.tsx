// import React from 'react';
// Import the original mapper
import MDXComponents from '@theme-original/MDXComponents';
import DefinitionList from '../components/DefinitionList';
import DefBox from '../components/CodeDefBox';
import DefHeading from '../components/CodeDefBox/DefHeading';
import DefContent from '../components/CodeDefBox/DefContent';

export default {
    // Re-use the default mapping
    ...MDXComponents,
    Dl: DefinitionList,
    DefBox: DefBox,
    DefHeading: DefHeading,
    DefContent: DefContent
};
