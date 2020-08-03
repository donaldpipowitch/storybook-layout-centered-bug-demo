import styled from 'styled-components';

export type BadgeProps = { color: string };

export const Badge = styled.span<BadgeProps>`
  display: inline-block;
  min-width: 7rem;
  padding: 0 0.9rem;
  border: 0.1rem solid transparent;
  line-height: 1.8rem;
  border-radius: 1rem;

  background-color: ${({ color }) => color};
  color: rgba(255, 255, 255, 0.75);

  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 0.15rem;
  text-align: center;
  text-transform: uppercase;
  word-break: break-word;
`;
