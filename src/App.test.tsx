import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { FetchResults } from './FetchResults';

test('renders learn react link', () => {
  render(<FetchResults id={'12345'} />);
  const linkElement = screen.getByText('search');
  expect(linkElement).toBeInTheDocument();
});


test('renders the landing page', () => {
  render(<App />);
});