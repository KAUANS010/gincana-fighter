import { z } from 'zod'

const email = z.string().trim().min(1, 'Informe seu e-mail.').email('Digite um e-mail válido.')

export const loginSchema = z.object({
  email,
  senha: z.string().min(1, 'Informe sua senha.'),
})

export const cadastroSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(3, 'O nome de exibição precisa ter pelo menos 3 caracteres.')
      .max(20, 'O nome de exibição pode ter no máximo 20 caracteres.')
      .regex(/^[\p{L}\p{N} _.-]+$/u, 'Use só letras, números, espaço, ponto, hífen ou sublinhado.'),
    email,
    senha: z
      .string()
      .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
      .regex(/[A-Za-z]/, 'A senha precisa ter pelo menos uma letra.')
      .regex(/\d/, 'A senha precisa ter pelo menos um número.'),
    confirmarSenha: z.string().min(1, 'Repita a senha.'),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  })
