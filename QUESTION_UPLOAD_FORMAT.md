# Question Upload JSON Format

This document describes the JSON format for bulk uploading questions to quizzes.

## Supported Question Types

1. **MCQ (Single Answer)**: `mcq_single`
2. **MCQ (Multiple Answers)**: `mcq_multiple`
3. **True/False**: `true_false`
4. **Fill in the Blanks**: `fill_blanks`

## Content Format

Currently, only **plain text** (`text`) is supported.

## JSON Structure

The JSON file must be an array of question objects. Each question object has the following structure:

### Common Fields (All Question Types)

| Field           | Type   | Required | Description                                                       |
| --------------- | ------ | -------- | ----------------------------------------------------------------- |
| `question_type` | string | Yes      | One of: `mcq_single`, `mcq_multiple`, `true_false`, `fill_blanks` |
| `content_type`  | string | Yes      | Currently only `text` is supported                                |
| `question_text` | string | Yes      | The question text                                                 |
| `points`        | number | Yes      | Points awarded for correct answer (must be positive)              |
| `tags`          | array  | No       | Array of strings for categorizing questions                       |

### Type-Specific Fields

#### For MCQ and True/False Questions

- `choices`: Array of choice objects
  - `text` (string): The choice text
  - `is_correct` (boolean): Whether this choice is correct

**Rules:**

- `mcq_single`: Must have exactly **one** correct answer
- `mcq_multiple`: Must have **at least one** correct answer
- `true_false`: Must have exactly **two** choices with **one** correct

#### For Fill in the Blanks Questions

- `correct_answers`: Array of strings representing acceptable answers
  - Multiple answers can be provided for case variations or synonyms

## Example Template

```json
[
  {
    "question_type": "mcq_single",
    "content_type": "text",
    "question_text": "What is 2 + 2?",
    "points": 1,
    "tags": ["math", "basic"],
    "choices": [
      { "text": "3", "is_correct": false },
      { "text": "4", "is_correct": true },
      { "text": "5", "is_correct": false },
      { "text": "6", "is_correct": false }
    ]
  },
  {
    "question_type": "mcq_multiple",
    "content_type": "text",
    "question_text": "Select all prime numbers",
    "points": 2,
    "tags": ["math", "prime"],
    "choices": [
      { "text": "2", "is_correct": true },
      { "text": "3", "is_correct": true },
      { "text": "4", "is_correct": false },
      { "text": "5", "is_correct": true }
    ]
  },
  {
    "question_type": "true_false",
    "content_type": "text",
    "question_text": "The Earth is flat",
    "points": 1,
    "tags": ["science"],
    "choices": [
      { "text": "True", "is_correct": false },
      { "text": "False", "is_correct": true }
    ]
  },
  {
    "question_type": "fill_blanks",
    "content_type": "text",
    "question_text": "The capital of France is ____",
    "points": 1,
    "tags": ["geography"],
    "correct_answers": ["Paris", "paris"]
  }
]
```

## Validation Rules

The system validates the following:

1. **Array Format**: JSON must be an array of question objects
2. **Question Type**: Must be one of the supported types
3. **Content Type**: Must be `text`
4. **Question Text**: Must be a non-empty string
5. **Points**: Must be a positive number
6. **Choices** (for MCQ/True-False):
   - Must have at least one choice
   - Each choice must have `text` (string) and `is_correct` (boolean)
   - Correct answer count must match question type requirements
7. **Correct Answers** (for Fill in Blanks):
   - Must be a non-empty array of strings

## Error Messages

If validation fails, you'll receive a specific error message indicating:

- Which question number has the issue
- What field is invalid
- What the requirement is

## Usage in Application

1. **Download Template**: Click "Download JSON Template" to get a starter file
2. **Edit Template**: Modify the JSON file with your questions
3. **Upload**: Click "Upload JSON File" and select your modified JSON
4. **Review**: Uploaded questions appear in the questions list and are fully editable
5. **Save Quiz**: Remember to save the quiz after uploading questions

## Best Practices

- Validate your JSON syntax before uploading (use a JSON validator)
- Keep question_text clear and concise
- Use meaningful tags for better organization
- Test with a small file first before uploading many questions
- For fill_blanks, include common variations in correct_answers
- Save your JSON files for future reference or modifications

## Notes

- All uploaded questions are added to the end of the existing questions list
- The quiz's total points are automatically updated
- Questions can be edited individually after upload
- Upload adds to existing questions (doesn't replace them)
- The order of questions in the JSON determines their initial order
