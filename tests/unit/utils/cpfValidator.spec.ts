import { describe, test, expect } from 'vitest'

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]+/g, '');
  
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  const digit1 = remainder >= 10 ? 0 : remainder;
  
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
    const invalidCPFs = [
      '123.456.789-00',
      '12345678900',
      '111.111.111-11',
      '222.222.222-22',
      '999.999.999-99',
      '123.456.78',
      '123456',
      'abc.def.ghi-jk',
      '',
    ];
    
    invalidCPFs.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(false);
    });
  });
  
  test('manipula formatos e caracteres especiais corretamente', () => {
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
