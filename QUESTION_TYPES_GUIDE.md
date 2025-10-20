# Question Types and Rich Content Features

## Overview

The quiz system now supports multiple question types and rich content formatting including markdown, LaTeX math formulas, and code snippets.

## Question Types

### 1. MCQ (Single Answer)

- Traditional multiple-choice question with one correct answer
- 4 answer choices by default
- Only one choice can be marked as correct

### 2. MCQ (Multiple Answers)

- Multiple-choice question allowing multiple correct answers
- 4 answer choices by default
- Multiple choices can be marked as correct
- Students must select all correct answers to get full points

### 3. True/False

- Simple True/False question
- Only 2 answer choices: True and False
- One must be marked as correct

### 4. Fill in the Blanks

- Open-ended question requiring typed answers
- Supports multiple acceptable answers (comma-separated)
- Example: "Paris, paris, PARIS" (case variations)

## Content Formatting Types

### 1. Plain Text

- Standard text input
- No special formatting
- Best for simple questions

### 2. Markdown (with Code Snippets)

- Supports full markdown syntax
- Code highlighting with syntax specification
- GitHub Flavored Markdown (tables, task lists, etc.)

**Examples:**

````markdown
What does this Python code output?

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
```
````

Options:

- Hello, World!
- greet(World)
- Error
- None

````

### 3. LaTeX Math
- Inline math: `$equation$`
- Display math: `$$equation$$`
- Full LaTeX math syntax support

**Examples:**

```markdown
Solve for x: $x^2 + 5x + 6 = 0$

What is the derivative of $f(x) = x^3 + 2x^2 - 5x + 1$?

Calculate: $$\int_{0}^{\pi} \sin(x) dx$$

What is the value of $\frac{a^2 + b^2}{c}$ when $a=3$, $b=4$, and $c=5$?
````

## Creating Questions

1. **Select Question Type**: Choose from MCQ Single, MCQ Multiple, True/False, or Fill in the Blanks
2. **Select Content Format**: Choose Plain Text, Markdown, or LaTeX
3. **Enter Question Text**:
   - Plain text: Direct input
   - Markdown: Use markdown syntax with code blocks
   - LaTeX: Use `$...$` for inline math, `$$...$$` for display math
4. **Preview**: See how your formatted content will appear (for markdown/LaTeX)
5. **Set Points**: Assign point value for the question
6. **Configure Answers**:
   - MCQ: Enter choices and mark correct answer(s)
   - True/False: Select correct option
   - Fill in Blanks: Enter acceptable answers

## Backend Schema

Questions now include:

- `question_type`: 'mcq_single' | 'mcq_multiple' | 'true_false' | 'fill_blanks'
- `content_type`: 'text' | 'markdown' | 'latex'
- `correct_answers`: Array of strings (for fill-in-the-blank questions)
- `choices`: Array of choice objects with id, text, and is_correct

## Tips

1. **For Code Questions**: Use markdown format with language-specific code blocks
2. **For Math Questions**: Use LaTeX format for proper mathematical notation
3. **For Simple Questions**: Use plain text for fastest entry
4. **Multiple Answers**: Use MCQ Multiple when more than one answer is correct
5. **Case Sensitivity**: For fill-in-the-blank, add variations (e.g., "Python, python, PYTHON")

## Examples by Subject

### Computer Science

````markdown
**Markdown with Code:**

What is the time complexity of this algorithm?

```javascript
function findMax(arr) {
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}
```
````

Answer: O(n)

````

### Mathematics
```latex
**LaTeX Math:**

Simplify: $\frac{x^2 - 4}{x - 2}$ for $x \neq 2$

Find the limit: $$\lim_{x \to 0} \frac{\sin(x)}{x}$$
````

### General Knowledge

```text
**Plain Text:**

What is the capital of France?

Who wrote "Romeo and Juliet"?
```
