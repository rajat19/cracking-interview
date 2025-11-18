"""Interpreter Design Pattern - Arithmetic Expression Evaluator"""
from abc import ABC, abstractmethod
from typing import Dict


class Context:
    """Context class to hold variable values"""
    
    def __init__(self):
        self.variables: Dict[str, int] = {}
    
    def set_variable(self, name: str, value: int):
        self.variables[name] = value
    
    def get_variable(self, name: str) -> int:
        return self.variables.get(name, 0)


class Expression(ABC):
    """Abstract Expression"""
    
    @abstractmethod
    def interpret(self, context: Context) -> int:
        pass


class NumberExpression(Expression):
    """Terminal Expression for numbers"""
    
    def __init__(self, number: int):
        self.number = number
    
    def interpret(self, context: Context) -> int:
        return self.number


class VariableExpression(Expression):
    """Terminal Expression for variables"""
    
    def __init__(self, variable_name: str):
        self.variable_name = variable_name
    
    def interpret(self, context: Context) -> int:
        return context.get_variable(self.variable_name)


class AddExpression(Expression):
    """Non-terminal Expression for addition"""
    
    def __init__(self, left: Expression, right: Expression):
        self.left_expression = left
        self.right_expression = right
    
    def interpret(self, context: Context) -> int:
        return self.left_expression.interpret(context) + self.right_expression.interpret(context)


class SubtractExpression(Expression):
    """Non-terminal Expression for subtraction"""
    
    def __init__(self, left: Expression, right: Expression):
        self.left_expression = left
        self.right_expression = right
    
    def interpret(self, context: Context) -> int:
        return self.left_expression.interpret(context) - self.right_expression.interpret(context)


class MultiplyExpression(Expression):
    """Non-terminal Expression for multiplication"""
    
    def __init__(self, left: Expression, right: Expression):
        self.left_expression = left
        self.right_expression = right
    
    def interpret(self, context: Context) -> int:
        return self.left_expression.interpret(context) * self.right_expression.interpret(context)


class ExpressionParser:
    """Simple expression parser"""
    
    @staticmethod
    def parse(expression: str, context: Context) -> Expression:
        """Simple parsing for demonstration: 'x + y * z'"""
        tokens = expression.split()
        
        if len(tokens) == 3:
            left = ExpressionParser._parse_operand(tokens[0])
            operator = tokens[1]
            right = ExpressionParser._parse_operand(tokens[2])
            
            if operator == '+':
                return AddExpression(left, right)
            elif operator == '-':
                return SubtractExpression(left, right)
            elif operator == '*':
                return MultiplyExpression(left, right)
        
        return ExpressionParser._parse_operand(expression.strip())
    
    @staticmethod
    def _parse_operand(operand: str) -> Expression:
        try:
            number = int(operand)
            return NumberExpression(number)
        except ValueError:
            return VariableExpression(operand)


def main():
    """Client code"""
    context = Context()
    context.set_variable('x', 10)
    context.set_variable('y', 5)
    context.set_variable('z', 2)
    
    print("=== Interpreter Pattern Demo ===")
    
    # Direct expression building
    expression1 = AddExpression(
        NumberExpression(10),
        NumberExpression(5)
    )
    print(f"10 + 5 = {expression1.interpret(context)}")
    
    # Using variables
    expression2 = MultiplyExpression(
        VariableExpression('x'),
        VariableExpression('y')
    )
    print(f"x * y = {expression2.interpret(context)}")
    
    # Complex expression
    expression3 = AddExpression(
        VariableExpression('x'),
        MultiplyExpression(
            VariableExpression('y'),
            VariableExpression('z')
        )
    )
    print(f"x + (y * z) = {expression3.interpret(context)}")
    
    # Using simple parser
    print("\n=== Using Parser ===")
    parsed1 = ExpressionParser.parse('x + y', context)
    print(f"x + y = {parsed1.interpret(context)}")
    
    parsed2 = ExpressionParser.parse('10 * 3', context)
    print(f"10 * 3 = {parsed2.interpret(context)}")


if __name__ == "__main__":
    main()
