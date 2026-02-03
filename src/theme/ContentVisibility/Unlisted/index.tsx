import React, { type ReactNode } from 'react';
import { UnlistedMetadata } from '@docusaurus/theme-common';
import type { Props } from '@theme/ContentVisibility/Unlisted';
import Badge from '@tdev-components/shared/Badge';
import Icon from '@mdi/react';
import { mdiEye } from '@mdi/js';
import { SIZE_XS } from '@tdev-components/shared/iconSizes';

function UnlistedBanner({ className }: Props) {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', lineHeight: 0 }}>
            <Badge type="warning" title="Unlisted Page">
                <Icon path={mdiEye} size={SIZE_XS} />
            </Badge>
        </div>
    );
}

export default function Unlisted(props: Props): ReactNode {
    return (
        <>
            {/*
      Unlisted metadata declared here for simplicity.
      Ensures we never forget to add the correct noindex metadata.
      Also gives a central place for user to swizzle override default metadata.
      */}
            <UnlistedMetadata />
            <UnlistedBanner {...props} />
        </>
    );
}
