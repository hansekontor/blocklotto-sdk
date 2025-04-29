import styled, { keyframes } from "styled-components"

export const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
`

export const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 5px solid #e2e8f0;
  border-top-color: #3182ce;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

export const Message = styled.div`
  margin-top: 1rem;
`

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: '0.5rem'};
  padding: 1.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
`