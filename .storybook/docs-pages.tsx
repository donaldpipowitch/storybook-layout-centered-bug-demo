import 'loki/configure-react';
import {
  Title,
  Subtitle,
  Description,
  Props,
  Stories,
  PRIMARY_STORY,
} from '@storybook/addon-docs/blocks';
import React from 'react';

export const ComponentDocs = () => (
  <>
    <Title />
    <Subtitle />
    <Description />
    <Props story={PRIMARY_STORY} />
    <Stories includePrimary />
  </>
);

export const PageDocs = () => (
  <>
    <Title />
    <Subtitle />
    <Description />
    <div className="custom-page-docs">
      <Stories includePrimary />
    </div>
  </>
);
