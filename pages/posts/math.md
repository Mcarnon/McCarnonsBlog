---
title: Math Test
date: 2026-05-02 00:57:00
categories:
  - Demo
tags:
  - Math
  - Markdown
---

## Math Formula Test

This page is used to verify whether math formula rendering is already enabled.

## Inline Math

Euler's identity: $e^{i\pi} + 1 = 0$.

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$.

## Block Math

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

$$
\begin{aligned}
f(x) &= ax^2 + bx + c \\
f'(x) &= 2ax + b
\end{aligned}
$$

## Matrix

$$
A = \begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
$$

## Summation

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

## Limits

Inline limit: $\lim_{x \to 0} \frac{\sin x}{x} = 1$.

$$
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e
$$

## Derivatives

$$
\frac{d}{dx} x^n = nx^{n-1}
$$

$$
\frac{\partial^2 f}{\partial x^2} + \frac{\partial^2 f}{\partial y^2} = 0
$$

## Piecewise Function

$$
f(x) =
\begin{cases}
-x, & x < 0 \\
0, & x = 0 \\
x, & x > 0
\end{cases}
$$

## Equation System

$$
\begin{cases}
2x + y = 5 \\
x - y = 1
\end{cases}
$$

## Vectors

$$
\vec{a} \cdot \vec{b} = |\vec{a}| |\vec{b}| \cos \theta
$$

$$
\mathbf{v} = \begin{pmatrix}
v_1 \\
v_2 \\
v_3
\end{pmatrix}
$$

## Sets and Logic

$$
A \cup B = \{x \mid x \in A \lor x \in B\}
$$

$$
\forall \epsilon > 0, \exists \delta > 0, 0 < |x-a| < \delta \Rightarrow |f(x)-L| < \epsilon
$$

## Probability

$$
P(A \mid B) = \frac{P(A \cap B)}{P(B)}
$$

$$
E(X) = \sum_i x_i p_i
$$

## Greek Letters

$$
\alpha + \beta + \gamma + \Delta + \Omega + \lambda + \mu + \sigma
$$

## Formula Numbering Test

$$
E = mc^2 \tag{1}
$$

Reference test: formula number rendering depends on the math renderer configuration.

## Unsupported Syntax Check

If the following content renders correctly, the renderer supports this extension syntax.

$$
\ce{H2O + CO2 -> H2CO3}
$$
