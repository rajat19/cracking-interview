class Employee:
    def __init__(self, name, organization):
        self.name = name
        self.organization = organization

class Organization:
    def __init__(self, name):
        self.name = name
        self.employees: set[Employee] = set()
        self.suborgs: set[Organization] = set()

    def add_employee(self, employee: Employee):
        self.employees.add(employee)

    def add_suborg(self, suborg: "Organization"):
        self.suborgs.add(suborg)

    def get_closest_common_organization(self, employees: list[Employee]):
        pass
