
import { describe, test, expect } from 'vitest'

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]+/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  const digit1 = remainder >= 10 ? 0 : remainder;
  
  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  const digit2 = remainder >= 10 ? 0 : remainder;
  
  return parseInt(cleanCPF.charAt(9)) === digit1 && parseInt(cleanCPF.charAt(10)) === digit2;
};

describe('CPF Validator', () => {
  test('retorna true para CPFs válidos', () => {

    const validCPFs = [
      '529.982.247-25',
      '52998224725',
      '853.513.468-93',
      '85351346893',
      '111.444.777-35'
    ];
    
    validCPFs.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(true);
    });
  });
  
  test('retorna false para CPFs inválidos', () => {
    // CPFs inválidos
    const invalidCPFs = [
      '123.456.789-00', // Dígitos verificadores incorretos
      '12345678900',
      '111.111.111-11', // Todos os dígitos iguais
      '222.222.222-22',
      '999.999.999-99',
      '123.456.78', // Tamanho incorreto
      '123456',
      'abc.def.ghi-jk', // Não numérico
      '', // Vazio
    ];
    
    invalidCPFs.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(false);
    });
  });
  
  test('manipula formatos e caracteres especiais corretamente', () => {
    // Mesmo CPF em diferentes formatos
    const validCPF = '529.982.247-25';
    const formats = [
      '529.982.247-25',
      '529-982-247.25',
      '529 982 247 25',
      '52998224725'
    ];
    
    formats.forEach(format => {
      expect(validateCPF(format)).toBe(validateCPF(validCPF));
    });
  });
});